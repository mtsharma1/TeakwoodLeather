import type { InvoiceData } from "@/types/order"
import { savePriceCheckData } from "@/action/db_action"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { NextResponse } from "next/server"
import { transformInvoiceData } from "@/lib/invoice-action-utils"
import { createInvoiceJob } from "@/lib/api"
import { format } from 'date-fns'
import prisma from "@/lib/prisma"

// Separate background processing function
async function processAndSaveInvoiceData(jobId: string, path: string) {
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

    const rawData = await fetchCSV<InvoiceData>(path)

    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        progress: 40,
        message: "Transforming invoice data..."
      }
    })

    const transformedData = transformInvoiceData(rawData)

    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        progress: 70,
        message: "Saving invoice data to database..."
      }
    })

    await savePriceCheckData(transformedData)

    // Update job status to completed
    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        status: "completed",
        progress: 100,
        message: "Invoice data processing completed successfully",
        completedAt: new Date()
      }
    })

    console.log("Invoice data processing and saving completed successfully")
  } catch (error) {
    console.error("Background invoice processing error:", error)

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

// Get date range for the invoice job
function getDateRange() {
  const today = new Date()
  const isTodayMonday = today.getDay() === 1
  const tomorrow = format(new Date(today.setDate(today.getDate() + 1)), "yyyy-MM-dd")
  const dayBeforeYesterday = format(new Date(today.setDate(today.getDate() - 2)), "yyyy-MM-dd") // Adjusting for the +1 above
  const dayBeforeYesterday_2 = format(new Date(today.setDate(today.getDate() - 1)), "yyyy-MM-dd") // Adjusting for the -2 above

  return {
    startDate: isTodayMonday ? dayBeforeYesterday_2 : dayBeforeYesterday,
    endDate: tomorrow
  }
}

export async function GET() {
  try {
    // Create a new job status record
    const jobStatus = await prisma.jobStatus.upsert({
      where: {
        jobType: "invoice",

      },
      update: {
        status: "pending",
        message: "Creating invoice export job...",
        startedAt: new Date(),
      },
      create: {
        jobType: "invoice",
        status: "pending",
        message: "Creating invoice export job..."
      }
    })

    // Step 1: Clear existing data
    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        message: "Clearing existing data...",
        progress: 2
      }
    })

    await prisma.priceCheckData.deleteMany()

    // Step 2: Calculate date range
    const { startDate, endDate } = getDateRange()

    // Step 3: Create the export job
    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        message: "Creating export job...",
        progress: 5
      }
    })

    const jobResponse = await createInvoiceJob(startDate, endDate)

    if (!jobResponse.successful) {
      // Update job status to failed
      await prisma.jobStatus.update({
        where: { id: jobStatus.id },
        data: {
          status: "failed",
          error: "Failed to create invoice export job",
          completedAt: new Date()
        }
      })

      return NextResponse.json({
        success: false,
        message: 'Failed to create invoice export job',
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
        progress: 8
      }
    })

    // Step 4: Wait for the job to complete and get the file path
    const result = await pollJobStatus(jobCode, 100, 2000 * 4)
    const filePath = result.filePath

    // Update job status with file path
    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        filePath,
        message: "Export job completed, starting data processing...",
        progress: 10
      }
    })

    // Step 5: Return the response immediately with the file path
    // While kicking off background processing
    processAndSaveInvoiceData(jobStatus.id, filePath).catch(err =>
      console.error("Failed in background invoice processing:", err)
    )

    // Return success response immediately with the file path
    return NextResponse.json({
      success: true,
      message: 'Invoice data processing started',
      filePath: filePath,
      jobId: jobStatus.id,
      note: 'Data processing continues in background',
      dateRange: { startDate, endDate },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Invoice API execution failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to process invoice data',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}