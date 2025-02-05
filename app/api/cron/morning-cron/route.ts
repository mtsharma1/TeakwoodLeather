import type { InvoiceData } from "@/types/order"
import { savePriceCheckData } from "@/action/db_action"
import { exportInvoices, fetchCSV } from "@/action/csv"
import { NextRequest, NextResponse } from "next/server"
import { transformInvoiceData } from "@/lib/invoice-action-utils"

async function fetchAndSaveMonthlyData() {

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

export async function GET(request: NextRequest) {
  console.log('🔔 Cron triggered:', new Date().toISOString());

  const isVercelCron = request.headers.get('x-vercel-cron') === '1';

  if (!isVercelCron && !request.headers.get('authorization')?.startsWith('Bearer')) {
    console.error('❌ Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Cron job executed at', new Date().toISOString());

    await fetchAndSaveMonthlyData();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}