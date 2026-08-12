import { NextResponse } from "next/server"
import { unstable_noStore as noStore } from "next/cache"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { saveReturnReverseData } from "@/action/db_action"
import { createReturnReverseJob } from "@/lib/api"
import prisma from "@/lib/prisma"

export const maxDuration = 300
export const dynamic = "force-dynamic"

async function fetchAndSaveReturnReverseData() {
  noStore()
  const jobResponse = await createReturnReverseJob()

  if (!jobResponse?.successful || !jobResponse?.jobCode) {
    throw new Error(`Failed to create return reverse export job: ${JSON.stringify(jobResponse)}`)
  }

  const result = await pollJobStatus(jobResponse.jobCode, 100, 2000 * 4)
  const path = result.filePath
  const rawData = await fetchCSV<Record<string, string | number>>(path)

  await saveReturnReverseData(rawData)
  console.log("Return Reverse cron completed:", new Date().toISOString())
}

export async function GET() {
  console.log("Return Reverse cron triggered:", new Date().toISOString())
  const jobStatus = await prisma.jobStatus.upsert({
    where: { jobType: "return-reverse" },
    update: {
      status: "processing",
      progress: 5,
      message: "Cron triggered. Starting return reverse sync...",
      error: null,
      completedAt: null,
      startedAt: new Date(),
    },
    create: {
      jobType: "return-reverse",
      status: "processing",
      progress: 5,
      message: "Cron triggered. Starting return reverse sync...",
      startedAt: new Date(),
    },
  })

  ;(async () => {
    try {
      await fetchAndSaveReturnReverseData()
      await prisma.jobStatus.update({
        where: { id: jobStatus.id },
        data: {
          status: "completed",
          progress: 100,
          message: "Return reverse synced successfully via cron",
          completedAt: new Date(),
        },
      })
    } catch (error) {
      console.error("Background process failed: [fetchAndSaveReturnReverseData]", error)
      await prisma.jobStatus.update({
        where: { id: jobStatus.id },
        data: {
          status: "failed",
          progress: 0,
          message: "Return reverse cron sync failed",
          error: error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        },
      })
    }
  })()

  return NextResponse.json({
    success: true,
    message: "Return Reverse cron job scheduled successfully",
    timestamp: new Date().toISOString(),
  })
}
