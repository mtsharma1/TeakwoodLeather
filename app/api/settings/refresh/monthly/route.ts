import type { MonthDataItem } from "@/types/order"
import { saveMonthlyDataOptimally } from "@/action/db_action"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { transformData } from "@/lib/action-utils"
import { NextResponse } from "next/server"
import { createMontlyReportJob } from "@/lib/api"

async function fetchAndSaveMonthlyData() {
  try {
    const jobResponse = await createMontlyReportJob()

    if (!jobResponse.successful) {
      throw new Error(`Failed to create export job: ${JSON.stringify(jobResponse)}`)
    }
    const jobCode = jobResponse.jobCode

    const result = await pollJobStatus(jobCode, 100, 2000 * 4);
    const path = result.filePath
    const rawData = await fetchCSV<MonthDataItem>(path)
    const transformedData = transformData(rawData)

    await saveMonthlyDataOptimally(transformedData)
    return { success: true, filePath: path }
  } catch (error) {
    console.error("Error in fetchAndSaveMonthlyData:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function GET() {
  try {
    const result = await fetchAndSaveMonthlyData();
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Failed to process monthly data',
        error: result.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Monthly data processed successfully',
      filePath: result.filePath,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Cron job execution failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}