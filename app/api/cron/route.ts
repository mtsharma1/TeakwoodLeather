import type { MonthDataItem } from "@/types/order"
import { saveMonthlyDataOptimally } from "@/action/db_action"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { transformData } from "@/lib/action-utils"
import { NextResponse } from "next/server"
import { unstable_noStore as noStore } from 'next/cache';
import { createMontlyReportJob } from "@/lib/api"

async function fetchAndSaveMonthlyData() {
  noStore();
  try {
    const jobResponse = await createMontlyReportJob()
    console.log(jobResponse, "jobResponse")

    if (!jobResponse.successful) {
      throw new Error(`Failed to create export job: ${JSON.stringify(jobResponse)}`)
    }
    const jobCode = jobResponse.jobCode

    const result = await pollJobStatus(jobCode, 100, 2000 * 4);
    const path = result.filePath
    const rawData = await fetchCSV<MonthDataItem>(path)
    const transformedData = transformData(rawData)

    await saveMonthlyDataOptimally(transformedData)
    console.log('✅ Monthly data processing completed:', new Date().toISOString());
  } catch (error) {
    console.error("Error in fetchAndSaveMonthlyData:", error)
  }
}

export async function GET() {
  console.log('🔔 Cron triggered:', new Date().toISOString());

  (async () => {
    try {
      await fetchAndSaveMonthlyData();
    } catch (error) {
      console.error('Background process failed: [fetchAndSaveMonthlyData]', error);
    }
  })();

  return NextResponse.json({
    success: true,
    message: 'Cron job scheduled successfully',
    timestamp: new Date().toISOString()
  });
}
