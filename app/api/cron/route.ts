import { unstable_noStore } from "next/cache"
// import type { MonthDataItem } from "@/types/order"
// import { saveMonthlyDataOptimally } from "@/action/db_action"
// import { exportMonthlyReport, fetchCSV } from "@/action/csv"
// import { transformData } from "@/lib/action-utils"
// import { NextRequest, NextResponse } from "next/server"

async function fetchAndSaveMonthlyData() {
  unstable_noStore()

  try {
    // Fetch and transform data
    console.log("1st");
    // const path = (await exportMonthlyReport()).filePath
    // if (!path) {
    //   throw new Error("Failed to get monthly report path")
    // }

    // const rawData = await fetchCSV<MonthDataItem>(path)
    // const transformedData = transformData(rawData)

    // // Save data to database
    // await saveMonthlyDataOptimally(transformedData)

  } catch (error) {
    console.error("Error in fetchAndSaveMonthlyData:", error)
  }
}

export async function GET() {
  // convert to "POST" eventually
  // Verify the request is coming from Vercel's cron job
  // You might want to add additional security checks here
  console.log("ayah to ha ")
  await fetchAndSaveMonthlyData()
  return Response.json({ message: "Monthly data updated successfully", status: 200 })

}
