import type { ProductData } from "@/types/order"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { NextResponse } from "next/server"
import { unstable_noStore as noStore } from 'next/cache';
import { createItemMasterDropboxJob } from "@/lib/api"
import { saveProductsOptimally } from "@/action/db_action";

async function fetchAndSkuDropboxUrlData() {
  noStore();
  try {
    const jobResponse = await createItemMasterDropboxJob()
    console.log(jobResponse, "jobResponse")

    if (!jobResponse.successful) {
      throw new Error(`Failed to create export job: ${JSON.stringify(jobResponse)}`)
    }
    const jobCode = jobResponse.jobCode

    const result = await pollJobStatus(jobCode, 100, 2000 * 4);
    const path = result.filePath
    const rawData = await fetchCSV<ProductData>(path)

    await saveProductsOptimally(rawData)
    console.log('Fetch SKU Images data processing completed:', new Date().toISOString());
  } catch (error) {
    console.error("Error in fetchAndSkuDropboxUrlData:", error)
  }
}

export async function GET() {
  console.log('🔔 Cron triggered:', new Date().toISOString());

  (async () => {
    try {
      await fetchAndSkuDropboxUrlData();
    } catch (error) {
      console.error('Background process failed: [fetchAndSkuDropboxUrlData]', error);
    }
  })();

  return NextResponse.json({
    success: true,
    message: 'Cron job scheduled successfully',
    timestamp: new Date().toISOString()
  });
}
