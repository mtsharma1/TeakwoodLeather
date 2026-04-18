import { saveReturnCourierData } from "@/action/db_action"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { NextResponse } from "next/server"
import { createReturnInvoiceCourierJob } from "@/lib/api"
import prisma from "@/lib/prisma"

function isAlreadyRunningError(jobResponse: unknown) {
  const candidate = jobResponse as { errors?: Array<{ code?: number; message?: string }>; message?: string } | null
  const message = `${candidate?.message ?? ""}`.toUpperCase()
  const hasInvalidStateMessage = message.includes("INVALID_STATE")
  const hasInvalidStateError = (candidate?.errors ?? []).some(
    (err) => err?.code === 100014 || `${err?.message ?? ""}`.toUpperCase().includes("INVALID_STATE")
  )
  return hasInvalidStateMessage || hasInvalidStateError
}

async function getLatestReturnExportFilePathFallback() {
  const latest = await prisma.jobStatus.findFirst({
    where: {
      jobType: { in: ["return-courier", "return-invoice", "return-reverse"] },
      filePath: { not: null },
    },
    orderBy: { updatedAt: "desc" },
  })

  return latest?.filePath ?? null
}

async function processAndSaveReturnCourierData(jobId: string, path: string) {
  try {
    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        status: "processing",
        progress: 10,
        message: "Downloading and parsing return courier CSV...",
      },
    })

    const rawData = await fetchCSV<Record<string, string | number>>(path)

    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        progress: 70,
        message: "Saving return courier data to database...",
      },
    })

    await saveReturnCourierData(rawData)

    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        status: "completed",
        progress: 100,
        message: "Return courier data processing completed successfully",
        error: null,
        completedAt: new Date(),
      },
    })
  } catch (error) {
    console.error("Background return courier processing error:", error)
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
      where: { jobType: "return-courier" },
      update: {
        status: "pending",
        message: "Creating return courier export job...",
        error: null,
        startedAt: new Date(),
      },
      create: {
        jobType: "return-courier",
        status: "pending",
        message: "Creating return courier export job...",
      },
    })

    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        message: "Creating export job...",
        progress: 5,
      },
    })

    const jobResponse = await createReturnInvoiceCourierJob()
    let filePath = ""

    if (!jobResponse.successful) {
      if (!isAlreadyRunningError(jobResponse)) {
        await prisma.jobStatus.update({
          where: { id: jobStatus.id },
          data: {
            status: "failed",
            error: "Failed to create return courier export job",
            completedAt: new Date(),
          },
        })

        return NextResponse.json({
          success: false,
          message: "Failed to create return courier export job",
          error: jobResponse,
          jobId: jobStatus.id,
          timestamp: new Date().toISOString(),
        }, { status: 500 })
      }

      const fallbackFilePath = await getLatestReturnExportFilePathFallback()
      if (!fallbackFilePath) {
        await prisma.jobStatus.update({
          where: { id: jobStatus.id },
          data: {
            status: "failed",
            error: "Return export already running and no fallback file available",
            completedAt: new Date(),
          },
        })

        return NextResponse.json({
          success: false,
          message: "Return export already running and no fallback file available",
          error: jobResponse,
          jobId: jobStatus.id,
          timestamp: new Date().toISOString(),
        }, { status: 500 })
      }

      filePath = fallbackFilePath
    } else {
      const result = await pollJobStatus(jobResponse.jobCode, 100, 2000 * 4)
      filePath = result.filePath
    }

    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        filePath,
        message: "Export job completed, starting data processing...",
        progress: 10,
      },
    })

    processAndSaveReturnCourierData(jobStatus.id, filePath).catch((err) =>
      console.error("Failed in background return courier processing:", err)
    )

    return NextResponse.json({
      success: true,
      message: "Return courier data processing started",
      filePath,
      jobId: jobStatus.id,
      note: "Data processing continues in background",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Return courier API execution failed:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to process return courier data",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
