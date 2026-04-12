import type { ReturnInvoiceData } from "@/types/order"
import { saveReturnInvoiceData } from "@/action/db_action"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { NextResponse } from "next/server"
import { createReturnInvoiceJob } from "@/lib/api"
import prisma from "@/lib/prisma"

async function processAndSaveReturnInvoiceData(jobId: string, path: string) {
  try {
    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        status: "processing",
        progress: 10,
        message: "Downloading and parsing return invoice CSV...",
      },
    })

    const rawData = await fetchCSV<ReturnInvoiceData>(path)

    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        progress: 40,
        message: "Transforming return invoice data...",
      },
    })

    await saveReturnInvoiceData(rawData as unknown as Record<string, string | number>[])

    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        status: "completed",
        progress: 100,
        message: "Return invoice data processing completed successfully",
        completedAt: new Date(),
      },
    })
  } catch (error) {
    console.error("Background return invoice processing error:", error)

    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date(),
      },
    })
  }
}

export async function GET() {
  try {
    const jobStatus = await prisma.jobStatus.upsert({
      where: {
        jobType: "return-invoice",
      },
      update: {
        status: "pending",
        message: "Creating return invoice export job...",
        startedAt: new Date(),
      },
      create: {
        jobType: "return-invoice",
        status: "pending",
        message: "Creating return invoice export job...",
      },
    })

    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        message: "Clearing existing return invoice data...",
        progress: 2,
      },
    })

    await prisma.returnInvoiceData.deleteMany()

    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        message: "Creating export job...",
        progress: 5,
      },
    })

    const jobResponse = await createReturnInvoiceJob()

    if (!jobResponse.successful) {
      await prisma.jobStatus.update({
        where: { id: jobStatus.id },
        data: {
          status: "failed",
          error: "Failed to create return invoice export job",
          completedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: false,
        message: "Failed to create return invoice export job",
        error: jobResponse,
        jobId: jobStatus.id,
        timestamp: new Date().toISOString(),
      }, { status: 500 })
    }

    const jobCode = jobResponse.jobCode

    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        message: "Waiting for export job to complete...",
        progress: 8,
      },
    })

    const result = await pollJobStatus(jobCode, 100, 2000 * 4)
    const filePath = result.filePath

    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        filePath,
        message: "Export job completed, starting data processing...",
        progress: 10,
      },
    })

    processAndSaveReturnInvoiceData(jobStatus.id, filePath).catch((err) =>
      console.error("Failed in background return invoice processing:", err)
    )

    return NextResponse.json({
      success: true,
      message: "Return invoice data processing started",
      filePath,
      jobId: jobStatus.id,
      note: "Data processing continues in background",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Return invoice API execution failed:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to process return invoice data",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
