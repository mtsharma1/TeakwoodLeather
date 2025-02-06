import type { InvoiceData } from "@/types/order"
import { savePriceCheckData } from "@/action/db_action"
import { exportInvoices, fetchCSV } from "@/action/csv"
import { NextResponse } from "next/server"
import { transformInvoiceData } from "@/lib/invoice-action-utils"
import { unstable_noStore as noStore } from 'next/cache';

async function fetchAndSaveMonthlyData() {
noStore();
  try {
    const path = (await exportInvoices()).filePath
    if (!path) {
      throw new Error("Failed to get monthly report path")
    }

    const rawData = await fetchCSV<InvoiceData>(path)
    const transformedData = transformInvoiceData(rawData)

    await savePriceCheckData(transformedData)

  } catch (error) {
    console.error("Error in fetchAndSaveMonthlyData:", error)
  }
}

export async function GET() {
  console.log('🔔 Cron triggered:', new Date().toISOString());

  try {
    console.log('Cron job executed at', new Date().toISOString());

    await fetchAndSaveMonthlyData();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
