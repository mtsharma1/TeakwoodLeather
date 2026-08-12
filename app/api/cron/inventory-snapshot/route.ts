import { unstable_noStore as noStore } from "next/cache"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { syncInventorySnapshot } from "@/lib/inventory-snapshot-sync"

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function GET() {
  noStore()
  console.log("Inventory snapshot cron triggered:", new Date().toISOString())

  const jobStatus = await prisma.jobStatus.upsert({
    where: { jobType: "inventory-snapshot" },
    update: {
      status: "processing",
      progress: 5,
      message: "Cron triggered. Starting inventory snapshot sync...",
      error: null,
      filePath: null,
      completedAt: null,
      startedAt: new Date(),
    },
    create: {
      jobType: "inventory-snapshot",
      status: "processing",
      progress: 5,
      message: "Cron triggered. Starting inventory snapshot sync...",
      startedAt: new Date(),
    },
  })

  try {
    const result = await syncInventorySnapshot(async (progress, message) => {
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
        message: `Inventory snapshot synced successfully via cron (${result.savedCount} rows)`,
        filePath: result.filePath,
        error: null,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Inventory snapshot synced successfully",
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Inventory snapshot cron failed:", error)
    const message = error instanceof Error ? error.message : String(error)

    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        status: "failed",
        progress: 0,
        message: "Inventory snapshot cron sync failed",
        error: message,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: false,
      message: "Inventory snapshot sync failed",
      error: message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
