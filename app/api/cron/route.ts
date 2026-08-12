import { unstable_noStore as noStore } from "next/cache"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { syncMonthlyReport } from "@/lib/monthly-report-sync"

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function GET() {
  noStore()
  console.log("Monthly report cron triggered:", new Date().toISOString())

  const jobStatus = await prisma.jobStatus.upsert({
    where: { jobType: "monthly" },
    update: {
      status: "processing",
      progress: 5,
      message: "Cron triggered. Starting monthly report sync...",
      error: null,
      filePath: null,
      completedAt: null,
      startedAt: new Date(),
    },
    create: {
      jobType: "monthly",
      status: "processing",
      progress: 5,
      message: "Cron triggered. Starting monthly report sync...",
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
        message: `Monthly report synced successfully via cron (${result.savedCount} rows)`,
        filePath: result.filePath,
        error: null,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Monthly report synced successfully",
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Monthly report cron failed:", error)
    const message = error instanceof Error ? error.message : String(error)

    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        status: "failed",
        progress: 0,
        message: "Monthly report cron sync failed",
        error: message,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: false,
      message: "Monthly report sync failed",
      error: message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
