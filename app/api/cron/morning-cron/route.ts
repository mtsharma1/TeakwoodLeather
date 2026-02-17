import type { InvoiceData } from "@/types/order"
import { savePriceCheckData } from "@/action/db_action"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { NextResponse } from "next/server"
import { transformInvoiceData } from "@/lib/invoice-action-utils"
import { unstable_noStore as noStore } from 'next/cache';
import { createInvoiceJob } from "@/lib/api"
import { format } from 'date-fns'
import prisma from "@/lib/prisma"

async function fetchAndSaveInvoiceData() {
  noStore();
  try {
    await prisma.priceCheckData.deleteMany()
    const today = new Date()
    const tomorrow = format(new Date().setDate(today.getDate() + 1), "yyyy-MM-dd")
    const dayBeforeYesterday = format(new Date().setDate(today.getDate() - 1), "yyyy-MM-dd")

    const jobResponse = await createInvoiceJob(dayBeforeYesterday, tomorrow)

    if (!jobResponse.successful) {
      throw new Error(`Failed to create export job: ${JSON.stringify(jobResponse)}`)
    }

    const jobCode = jobResponse.jobCode

    const result = await pollJobStatus(jobCode, 100, 2000 * 4);
    const path = result.filePath
    const rawData = await fetchCSV<InvoiceData>(path)
    const transformedData = transformInvoiceData(rawData)
    await savePriceCheckData(transformedData)
    console.log("Invoice generate")
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
