import type { MonthDataItem } from "@/types/order"
import { saveMonthlyDataOptimally } from "@/action/db_action"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { transformData } from "@/lib/action-utils"
import { NextResponse } from "next/server"
import { createMontlyReportJob } from "@/lib/api"
import prisma from "@/lib/prisma"
import { unstable_noStore } from "next/cache"

// Separate background processing function
async function processAndSaveData(jobId: string, path: string) {
  try {
    // Update job status to processing
    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        status: "processing",
        progress: 10,
        message: "Downloading and parsing CSV file..."
      }
    })

    const rawData = await fetchCSV<MonthDataItem>(path)

    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        progress: 40,
        message: "Transforming data..."
      }
    })

    const transformedData = transformData(rawData)
    console.log(transformedData.length, "transformedData")

    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        progress: 70,
        message: "Saving data to database..."
      }
    })

    await saveMonthlyDataOptimally(transformedData)

    // Update job status to completed
    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        status: "completed",
        progress: 100,
        message: "Data processing completed successfully",
        completedAt: new Date()
      }
    })

    console.log("Data processing and saving completed successfully")
  } catch (error) {
    console.error("Background processing error:", error)

    // Update job status to failed
    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date()
      }
    })
  }
}

export async function GET() {
  unstable_noStore()
  try {
    // Create a new job status record
    const jobStatus = await prisma.jobStatus.upsert({
      where: {
        jobType: "monthly",
      },
      update: {
        status: "pending",
        message: "Creating export job...",
        startedAt: new Date(),
      },
      create: {
        jobType: "monthly",
        status: "pending",
        message: "Creating export job..."
      }
    })

    // Step 1: Create the export job
    const jobResponse = await createMontlyReportJob()

    if (!jobResponse.successful) {
      // Update job status to failed
      await prisma.jobStatus.update({
        where: { id: jobStatus.id },
        data: {
          status: "failed",
          error: "Failed to create export job",
          completedAt: new Date()
        }
      })

      return NextResponse.json({
        success: false,
        message: 'Failed to create export job',
        error: jobResponse,
        jobId: jobStatus.id,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    const jobCode = jobResponse.jobCode

    // Update job status
    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        message: "Waiting for export job to complete...",
        progress: 5
      }
    })

    // Step 2: Wait for the job to complete and get the file path
    const result = await pollJobStatus(jobCode, 100, 2000 * 4)
    const filePath = result.filePath
    console.log(filePath, "Monthly path")

    // Update job status with file path
    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        filePath,
        message: "Export job completed, starting data processing...",
        progress: 10
      }
    })

    // Step 3: Return the response immediately with the file path and job ID
    // While kicking off background processing
    processAndSaveData(jobStatus.id, filePath).catch(err =>
      console.error("Failed in background processing:", err)
    )

    // Return success response immediately with the file path and job ID
    return NextResponse.json({
      success: true,
      message: 'Monthly data processing started',
      filePath: filePath,
      jobId: jobStatus.id,
      note: 'Data processing continues in background',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('API execution failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to process monthly data',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}