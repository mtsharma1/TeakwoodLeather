import type { MonthDataItem } from "@/types/order"
import { saveMonthlyDataOptimally } from "@/action/db_action"
import { exportMonthlyReport, fetchCSV } from "@/action/csv"
import { transformData } from "@/lib/action-utils"
import { NextRequest, NextResponse } from "next/server"

async function fetchAndSaveMonthlyData() {

  try {
    const path = (await exportMonthlyReport()).filePath
    if (!path) {
      throw new Error("Failed to get monthly report path")
    }

    const rawData = await fetchCSV<MonthDataItem>(path)
    const transformedData = transformData(rawData)

    await saveMonthlyDataOptimally(transformedData)

  } catch (error) {
    console.error("Error in fetchAndSaveMonthlyData:", error)
  }
}

export async function GET(request: NextRequest) {
  console.log('🔔 Cron triggered:', new Date().toISOString());

 // const isVercelCron = request.headers.get('x-vercel-cron') === '1';

//  if (!isVercelCron && !request.headers.get('authorization')?.startsWith('Bearer')) {
 //   console.error('❌ Unauthorized access attempt');
  //  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//  }

  try {
    console.log('Cron job executed at', new Date().toISOString());

    await fetchAndSaveMonthlyData();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
