import type { ProductData } from "@/types/order"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { NextResponse } from "next/server"
import { createItemMasterDropboxJob } from "@/lib/api"
import { saveProductsOptimally } from "@/action/db_action";

async function fetchAndSkuDropboxUrlData() {
  try {
    const jobResponse = await createItemMasterDropboxJob()

    if (!jobResponse.successful) {
      throw new Error(`Failed to create export job: ${JSON.stringify(jobResponse)}`)
    }
    const jobCode = jobResponse.jobCode

    const result = await pollJobStatus(jobCode, 100, 2000 * 4);
    const path = result.filePath
    const rawData = await fetchCSV<ProductData>(path)

    await saveProductsOptimally(rawData)
    return { success: true, filePath: path }
  } catch (error) {
    console.error("Error in fetchAndSkuDropboxUrlData:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function GET() {
  try {
    const result = await fetchAndSkuDropboxUrlData();
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Failed to process SKU dropbox data',
        error: result.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'SKU dropbox data processed successfully',
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