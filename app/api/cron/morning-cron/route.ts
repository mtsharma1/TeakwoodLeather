import type { InvoiceData } from "@/types/order"
import { savePriceCheckData } from "@/action/db_action"
import { exportInvoices, fetchCSV } from "@/action/csv"
import { NextResponse } from "next/server"
import { transformInvoiceData } from "@/lib/invoice-action-utils"
import { unstable_noStore as noStore } from 'next/cache';

async function fetchAndSaveInvoiceData() {
  noStore();
  try {
    const path = (await exportInvoices()).filePath
    if (!path) {
      throw new Error("Failed to get Invoice report path")
    }
    const rawData = await fetchCSV<InvoiceData>(path)
    const transformedData = transformInvoiceData(rawData)
    await savePriceCheckData(transformedData)
  } catch (error) {
    console.error("Error in fetchAndSaveInvoiceData:", error)
  }
}

export async function GET() {
  try {
    console.log('Cron job executed at', new Date().toISOString());
    (async () => {
      try {
        await fetchAndSaveInvoiceData();
      } catch (error) {
        console.error('Background process failed: [fetchAndSaveInvoiceData]', error);
      }
    })();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
