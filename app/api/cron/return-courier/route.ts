import { NextResponse } from "next/server"
import { unstable_noStore as noStore } from "next/cache"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { saveReturnCourierData } from "@/action/db_action"
import { createReturnCourierJob } from "@/lib/api"
import prisma from "@/lib/prisma"

async function fetchAndSaveReturnCourierData() {
  noStore()
  const jobResponse = await createReturnCourierJob()

  if (!jobResponse?.successful || !jobResponse?.jobCode) {
    throw new Error(`Failed to create return courier export job: ${JSON.stringify(jobResponse)}`)
  }

  const result = await pollJobStatus(jobResponse.jobCode, 100, 2000 * 4)
  const path = result.filePath
  const rawData = await fetchCSV<Record<string, string | number>>(path)

  await saveReturnCourierData(rawData)
  console.log("Return Courier cron completed:", new Date().toISOString())
}

export async function GET() {
  console.log("Return Courier cron triggered:", new Date().toISOString())
  const jobStatus = await prisma.jobStatus.upsert({
    where: { jobType: "return-courier" },
    update: {
      status: "processing",
      progress: 5,
      message: "Cron triggered. Starting return courier sync...",
      error: null,
      completedAt: null,
      startedAt: new Date(),
    },
    create: {
      jobType: "return-courier",
      status: "processing",
      progress: 5,
      message: "Cron triggered. Starting return courier sync...",
      startedAt: new Date(),
    },
  })

  ;(async () => {
    try {
      await fetchAndSaveReturnCourierData()
      await prisma.jobStatus.update({
        where: { id: jobStatus.id },
        data: {
          status: "completed",
          progress: 100,
          message: "Return courier synced successfully via cron",
          completedAt: new Date(),
        },
      })
    } catch (error) {
      console.error("Background process failed: [fetchAndSaveReturnCourierData]", error)
      await prisma.jobStatus.update({
        where: { id: jobStatus.id },
        data: {
          status: "failed",
          progress: 0,
          message: "Return courier cron sync failed",
          error: error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        },
      })
    }
  })()

  return NextResponse.json({
    success: true,
    message: "Return Courier cron job scheduled successfully",
    timestamp: new Date().toISOString(),
  })
}

