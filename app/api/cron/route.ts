import type { MonthDataItem } from "@/types/order"
import { saveMonthlyDataOptimally } from "@/action/db_action"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { transformData } from "@/lib/action-utils"
import { NextResponse } from "next/server"
import { unstable_noStore as noStore } from 'next/cache';
import { createMontlyReportJob } from "@/lib/api"
import prisma from "@/lib/prisma"

async function fetchAndSaveMonthlyData() {
  noStore();
  const jobResponse = await createMontlyReportJob()
  console.log(jobResponse, "jobResponse")

  if (!jobResponse.successful) {
    throw new Error(`Failed to create export job: ${JSON.stringify(jobResponse)}`)
  }
  const jobCode = jobResponse.jobCode

  const result = await pollJobStatus(jobCode, 100, 2000 * 4);
  const path = result.filePath
  const rawData = await fetchCSV<MonthDataItem>(path)
  const transformedData = transformData(rawData)

  await saveMonthlyDataOptimally(transformedData)
  console.log('✅ Monthly data processing completed:', new Date().toISOString());
}

export async function GET() {
  console.log('🔔 Cron triggered:', new Date().toISOString());

  const jobStatus = await prisma.jobStatus.upsert({
    where: { jobType: "monthly" },
    update: {
      status: "processing",
      progress: 5,
      message: "Cron triggered. Starting monthly report sync...",
      error: null,
      completedAt: null,
      startedAt: new Date(),
    },
    create: {
      jobType: "monthly",
      status: "processing",
      progress: 5,
      message: "Cron triggered. Starting monthly report sync...",
      startedAt: new Date(),
    },
  })

  ;(async () => {
    try {
      await fetchAndSaveMonthlyData();
      await prisma.jobStatus.update({
        where: { id: jobStatus.id },
        data: {
          status: "completed",
          progress: 100,
          message: "Monthly report synced successfully via cron",
          completedAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Background process failed: [fetchAndSaveMonthlyData]', error);
      await prisma.jobStatus.update({
        where: { id: jobStatus.id },
        data: {
          status: "failed",
          progress: 0,
          message: "Monthly report cron sync failed",
          error: error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        },
      })
    }
  })();

  return NextResponse.json({
    success: true,
    message: 'Cron job scheduled successfully',
    timestamp: new Date().toISOString()
  });
}
