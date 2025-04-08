import type { InvoiceData } from "@/types/order"
import { savePriceCheckData } from "@/action/db_action"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { NextResponse } from "next/server"
import { transformInvoiceData } from "@/lib/invoice-action-utils"
import { createInvoiceJob } from "@/lib/api"
import { format } from 'date-fns'
import prisma from "@/lib/prisma"

async function fetchAndSaveInvoiceData() {
  try {
    await prisma.priceCheckData.deleteMany()
    const today = new Date()
    const isTodayMonday = today.getDay() === 1
    const tomorrow = format(new Date().setDate(today.getDate() + 1), "yyyy-MM-dd")
    const dayBeforeYesterday = format(new Date().setDate(today.getDate() - 1), "yyyy-MM-dd")
    const dayBeforeYesterday_2 = format(new Date().setDate(today.getDate() - 2), "yyyy-MM-dd")

    const jobResponse = await createInvoiceJob(isTodayMonday ? dayBeforeYesterday_2 : dayBeforeYesterday, tomorrow)

    if (!jobResponse.successful) {
      throw new Error(`Failed to create export job: ${JSON.stringify(jobResponse)}`)
    }

    const jobCode = jobResponse.jobCode

    const result = await pollJobStatus(jobCode, 100, 2000 * 4);
    const path = result.filePath
    const rawData = await fetchCSV<InvoiceData>(path)
    const transformedData = transformInvoiceData(rawData)
    await savePriceCheckData(transformedData)
    return { success: true, filePath: path }
  } catch (error) {
    console.error("Error in fetchAndSaveInvoiceData:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function GET() {
  try {
    const result = await fetchAndSaveInvoiceData();

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Failed to process invoice data',
        error: result.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice data processed successfully',
      filePath: result.filePath,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}