import type { MonthDataItem } from "@/types/order"
import { saveMonthlyDataOptimally } from "@/action/db_action"
import { exportMonthlyReport, fetchCSV } from "@/action/csv"
import { transformData } from "@/lib/action-utils"
import { NextResponse } from "next/server"
import { unstable_noStore as noStore } from 'next/cache';

async function fetchAndSaveMonthlyData() {
  noStore();
  try {
    const path = (await exportMonthlyReport()).filePath
    if (!path) {
      throw new Error("Failed to get monthly report path")
    }

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

  // Schedule the data processing in the background
  (async () => {
    try {
      await fetchAndSaveMonthlyData();
    } catch (error) {
      console.error('Background process failed:', error);
    }
  })();

  // Immediately return success response
  return NextResponse.json({ 
    success: true, 
    message: 'Cron job scheduled successfully',
    timestamp: new Date().toISOString()
  });
}
