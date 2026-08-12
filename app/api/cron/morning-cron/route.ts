import type { InvoiceData } from "@/types/order"
import { savePriceCheckData } from "@/action/db_action"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { NextResponse } from "next/server"
import { transformInvoiceData } from "@/lib/invoice-action-utils"
import { unstable_noStore as noStore } from 'next/cache';
import { createInvoiceJob } from "@/lib/api"
import { format } from 'date-fns'
import prisma from "@/lib/prisma"

export const maxDuration = 300
export const dynamic = "force-dynamic"

async function fetchAndSaveInvoiceData() {
  noStore();
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
}

export async function GET() {
  try {
    console.log('Cron job executed at', new Date().toISOString());
    const jobStatus = await prisma.jobStatus.upsert({
      where: { jobType: "invoice" },
      update: {
        status: "processing",
        progress: 5,
        message: "Cron triggered. Starting invoice report sync...",
        error: null,
        completedAt: null,
        startedAt: new Date(),
      },
      create: {
        jobType: "invoice",
        status: "processing",
        progress: 5,
        message: "Cron triggered. Starting invoice report sync...",
        startedAt: new Date(),
      },
    })
    ;(async () => {
      try {
        await fetchAndSaveInvoiceData();
        await prisma.jobStatus.update({
          where: { id: jobStatus.id },
          data: {
            status: "completed",
            progress: 100,
            message: "Invoice report synced successfully via cron",
            completedAt: new Date(),
          },
        })
      } catch (error) {
        console.error('Background process failed: [fetchAndSaveInvoiceData]', error);
        await prisma.jobStatus.update({
          where: { id: jobStatus.id },
          data: {
            status: "failed",
            progress: 0,
            message: "Invoice report cron sync failed",
            error: error instanceof Error ? error.message : "Unknown error",
            completedAt: new Date(),
          },
        })
      }
    })();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
