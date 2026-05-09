import { NextResponse } from "next/server"
import { unstable_noStore as noStore } from "next/cache"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { saveReturnCourierData } from "@/action/db_action"
import { createReturnCourierJob } from "@/lib/api"

async function fetchAndSaveReturnCourierData() {
  noStore()
  try {
    const jobResponse = await createReturnCourierJob()

    if (!jobResponse?.successful || !jobResponse?.jobCode) {
      throw new Error(`Failed to create return courier export job: ${JSON.stringify(jobResponse)}`)
    }

    const result = await pollJobStatus(jobResponse.jobCode, 100, 2000 * 4)
    const path = result.filePath
    const rawData = await fetchCSV<Record<string, string | number>>(path)

    await saveReturnCourierData(rawData)
    console.log("Return Courier cron completed:", new Date().toISOString())
  } catch (error) {
    console.error("Error in fetchAndSaveReturnCourierData:", error)
  }
}

export async function GET() {
  console.log("Return Courier cron triggered:", new Date().toISOString())

  ;(async () => {
    try {
      await fetchAndSaveReturnCourierData()
    } catch (error) {
      console.error("Background process failed: [fetchAndSaveReturnCourierData]", error)
    }
  })()

  return NextResponse.json({
    success: true,
    message: "Return Courier cron job scheduled successfully",
    timestamp: new Date().toISOString(),
  })
}

