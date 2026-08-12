import { saveReturnReverseData } from "@/action/db_action"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { NextResponse } from "next/server"
import { createReturnReverseJob } from "@/lib/api"
import prisma from "@/lib/prisma"

export const maxDuration = 300
export const dynamic = "force-dynamic"

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
      jobType: "return-reverse",
      filePath: { not: null },
    },
    orderBy: { updatedAt: "desc" },
  })

  return latest?.filePath ?? null
}

async function processAndSaveReturnReverseData(jobId: string, path: string) {
  try {
    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        status: "processing",
        progress: 10,
        message: "Downloading and parsing return reverse CSV...",
      },
    })

    const rawData = await fetchCSV<Record<string, string | number>>(path)

    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        progress: 70,
        message: "Saving return reverse data to database...",
      },
    })

    await saveReturnReverseData(rawData)

    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        status: "completed",
        progress: 100,
        message: "Return reverse data processing completed successfully",
        error: null,
        completedAt: new Date(),
      },
    })
  } catch (error) {
    console.error("Background return reverse processing error:", error)
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
      where: { jobType: "return-reverse" },
      update: {
        status: "pending",
        progress: 0,
        message: "Creating return reverse export job...",
        error: null,
        completedAt: null,
        startedAt: new Date(),
      },
      create: {
        jobType: "return-reverse",
        status: "pending",
        message: "Creating return reverse export job...",
      },
    })

    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        message: "Creating export job...",
        progress: 5,
      },
    })

    const jobResponse = await createReturnReverseJob()

    let filePath = ""

    if (!jobResponse.successful) {
      if (!isAlreadyRunningError(jobResponse)) {
        await prisma.jobStatus.update({
          where: { id: jobStatus.id },
          data: {
            status: "failed",
            error: "Failed to create return reverse export job",
            completedAt: new Date(),
          },
        })

        return NextResponse.json({
          success: false,
          message: "Failed to create return reverse export job",
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

    processAndSaveReturnReverseData(jobStatus.id, filePath).catch((err) =>
      console.error("Failed in background return reverse processing:", err)
    )

    return NextResponse.json({
      success: true,
      message: "Return reverse data processing started",
      filePath,
      jobId: jobStatus.id,
      note: "Data processing continues in background",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Return reverse API execution failed:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to process return reverse data",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
