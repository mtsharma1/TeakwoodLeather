import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { syncMonthlyReport } from "@/lib/monthly-report-sync"

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function GET() {
  const jobStatus = await prisma.jobStatus.upsert({
    where: { jobType: "monthly" },
    update: {
      status: "processing",
      progress: 5,
      message: "Starting manual monthly report sync...",
      error: null,
      filePath: null,
      completedAt: null,
      startedAt: new Date(),
    },
    create: {
      jobType: "monthly",
      status: "processing",
      progress: 5,
      message: "Starting manual monthly report sync...",
      startedAt: new Date(),
    },
  })

  try {
    const result = await syncMonthlyReport(async (progress, message) => {
      await prisma.jobStatus.update({
        where: { id: jobStatus.id },
        data: { progress, message },
      })
    })

    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        status: "completed",
        progress: 100,
        message: `Monthly report refreshed successfully (${result.savedCount} rows)`,
        filePath: result.filePath,
        error: null,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Monthly report refreshed successfully",
      jobId: jobStatus.id,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Manual monthly report refresh failed:", error)
    const message = error instanceof Error ? error.message : String(error)

    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        status: "failed",
        progress: 0,
        message: "Monthly report refresh failed",
        error: message,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: false,
      message: "Failed to refresh monthly report",
      error: message,
      jobId: jobStatus.id,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
