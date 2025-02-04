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
  // Verify the request is a cron job (optional but recommended)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Perform your scheduled task here
    console.log('Cron job executed at', new Date().toISOString());
    
    // Example task: Cleanup or maintenance
    // await performScheduledTask();

    return NextResponse.json({ 
      success: true, 
      message: 'Cron job completed successfully' 
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Cron job failed' 
    }, { status: 500 });
  }
}