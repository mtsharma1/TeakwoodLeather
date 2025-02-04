import { NextRequest, NextResponse } from "next/server";
// import type { MonthDataItem } from "@/types/order"
// import { saveMonthlyDataOptimally } from "@/action/db_action"
// import { exportMonthlyReport, fetchCSV } from "@/action/csv"
// import { transformData } from "@/lib/action-utils"
// import { NextRequest, NextResponse } from "next/server"

// async function fetchAndSaveMonthlyData() {
//   unstable_noStore()

//   try {
//     // Fetch and transform data
//     console.log("1st");
//     // const path = (await exportMonthlyReport()).filePath
//     // if (!path) {
//     //   throw new Error("Failed to get monthly report path")
//     // }

//     // const rawData = await fetchCSV<MonthDataItem>(path)
//     // const transformedData = transformData(rawData)

//     // // Save data to database
//     // await saveMonthlyDataOptimally(transformedData)

//   } catch (error) {
//     console.error("Error in fetchAndSaveMonthlyData:", error)
//   }
// }

export async function GET(request: NextRequest) {
  console.log('🔔 Cron triggered:', new Date().toISOString());

  // For Vercel Cron, skip auth check if from internal trigger
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';

  if (!isVercelCron && !request.headers.get('authorization')?.startsWith('Bearer')) {
    console.error('❌ Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Cron job executed at', new Date().toISOString());

    // await performScheduledTask();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}