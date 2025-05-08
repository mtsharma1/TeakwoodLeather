import type { MonthDataItem } from "@/types/order"
import { saveMonthlyDataOptimally } from "@/action/db_action"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { transformData } from "@/lib/action-utils"
import { NextResponse } from "next/server"
import { createMontlyReportJob } from "@/lib/api"

// Separate background processing function
async function processAndSaveData(path: string) {
  try {
    const rawData = await fetchCSV<MonthDataItem>(path)
    const transformedData = transformData(rawData)
    console.log(transformedData.length, "transformedData")
    
    await saveMonthlyDataOptimally(transformedData)
    console.log("Data processing and saving completed successfully")
  } catch (error) {
    console.error("Background processing error:", error)
  }
}

export async function GET() {
  try {
    // Step 1: Create the export job
    const jobResponse = await createMontlyReportJob()

    if (!jobResponse.successful) {
      return NextResponse.json({
        success: false,
        message: 'Failed to create export job',
        error: jobResponse,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
    const jobCode = jobResponse.jobCode
    
    // Step 2: Wait for the job to complete and get the file path
    const result = await pollJobStatus(jobCode, 100, 2000 * 4)
    const filePath = result.filePath
    console.log(filePath, "Montly path")
    
    // Step 3: Return the response immediately with the file path
    // While kicking off background processing
    processAndSaveData(filePath).catch(err => 
      console.error("Failed in background processing:", err)
    )
    
    // Return success response immediately with the file path
    return NextResponse.json({
      success: true,
      message: 'Monthly data processing started',
      filePath: filePath,
      note: 'Data processing continues in background',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('API execution failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to process monthly data',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}