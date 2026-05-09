import { NextResponse } from "next/server"
import { unstable_noStore as noStore } from "next/cache"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { saveReturnReverseData } from "@/action/db_action"
import { createReturnReverseJob } from "@/lib/api"

async function fetchAndSaveReturnReverseData() {
  noStore()
  try {
    const jobResponse = await createReturnReverseJob()

    if (!jobResponse?.successful || !jobResponse?.jobCode) {
      throw new Error(`Failed to create return reverse export job: ${JSON.stringify(jobResponse)}`)
    }

    const result = await pollJobStatus(jobResponse.jobCode, 100, 2000 * 4)
    const path = result.filePath
    const rawData = await fetchCSV<Record<string, string | number>>(path)

    await saveReturnReverseData(rawData)
    console.log("Return Reverse cron completed:", new Date().toISOString())
  } catch (error) {
    console.error("Error in fetchAndSaveReturnReverseData:", error)
  }
}

export async function GET() {
  console.log("Return Reverse cron triggered:", new Date().toISOString())

  ;(async () => {
    try {
      await fetchAndSaveReturnReverseData()
    } catch (error) {
      console.error("Background process failed: [fetchAndSaveReturnReverseData]", error)
    }
  })()

  return NextResponse.json({
    success: true,
    message: "Return Reverse cron job scheduled successfully",
    timestamp: new Date().toISOString(),
  })
}

