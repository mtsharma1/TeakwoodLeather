import { NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { createChannelItemReportJob } from "@/lib/api"
import prisma from "@/lib/prisma"

export const maxDuration = 300
export const dynamic = "force-dynamic"

type ChannelReportRow = Record<string, string | number | null | undefined>

function readText(row: ChannelReportRow, key: string) {
  const value = row[key]
  return value === null || value === undefined ? "" : String(value).trim()
}

function readNumber(row: ChannelReportRow, key: string) {
  const value = Number(readText(row, key).replace(/,/g, ""))
  return Number.isFinite(value) ? value : 0
}

function transformChannelRows(rows: ChannelReportRow[]): Prisma.channelItemReportCreateManyInput[] {
  return rows
    .filter((row) => readText(row, "Status Code") !== "LINKED")
    .map((row) => {
      const sellerSkuCode = readText(row, "Seller Sku Code")

      return {
        uniware_sku_code: readText(row, "Uniware Sku Code"),
        channel_name: readText(row, "Channel Name"),
        product_name: readText(row, "Product Name"),
        channel_product_id: sellerSkuCode,
        seller_sku_code: sellerSkuCode,
        status_code: readText(row, "Status Code"),
        selling_price: readNumber(row, "Selling Price"),
        max_retail_price: readNumber(row, "Max Retail Price"),
      }
    })
}

async function syncChannelReport(onProgress: (progress: number, message: string) => Promise<void>) {
  await onProgress(10, "Creating channel report export job...")
  const jobResponse = await createChannelItemReportJob()

  if (!jobResponse?.successful || !jobResponse?.jobCode) {
    throw new Error(`Failed to create channel report export job: ${JSON.stringify(jobResponse)}`)
  }

  await onProgress(20, "Waiting for channel report CSV to become available...")
  const exportResult = await pollJobStatus(jobResponse.jobCode, 140, 2000)

  if (!exportResult.filePath) {
    throw new Error("Channel report export completed without a CSV file path")
  }

  await onProgress(45, "Downloading and parsing channel report CSV...")
  const rawData = await fetchCSV<ChannelReportRow>(exportResult.filePath)

  if (rawData.length === 0) {
    throw new Error("Channel report CSV contained no rows; existing data was preserved")
  }

  await onProgress(65, "Transforming channel report data...")
  const data = transformChannelRows(rawData)

  await onProgress(80, `Saving ${data.length} channel report rows...`)
  const [, saved] = await prisma.$transaction([
    prisma.channelItemReport.deleteMany(),
    prisma.channelItemReport.createMany({ data }),
  ])

  if (saved.count !== data.length) {
    throw new Error(`Channel report transformed ${data.length} rows but saved ${saved.count}`)
  }

  return {
    filePath: exportResult.filePath,
    fetchedCount: rawData.length,
    savedCount: saved.count,
  }
}

export async function GET() {
  const jobStatus = await prisma.jobStatus.upsert({
    where: { jobType: "channel-report" },
    update: {
      status: "processing",
      progress: 5,
      message: "Starting manual channel report sync...",
      error: null,
      filePath: null,
      completedAt: null,
      startedAt: new Date(),
    },
    create: {
      jobType: "channel-report",
      status: "processing",
      progress: 5,
      message: "Starting manual channel report sync...",
      startedAt: new Date(),
    },
  })

  try {
    const result = await syncChannelReport(async (progress, message) => {
      await prisma.jobStatus.update({
        where: { id: jobStatus.id },
        data: { progress, message },
      })
    })

    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        status: "completed",
        progress: 100,
        message: `Channel report refreshed successfully (${result.savedCount} rows)`,
        filePath: result.filePath,
        error: null,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Channel report refreshed successfully",
      jobId: jobStatus.id,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Channel report refresh failed:", error)
    const message = error instanceof Error ? error.message : String(error)

    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        status: "failed",
        progress: 0,
        message: "Channel report refresh failed",
        error: message,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: false,
      message: "Failed to refresh channel report",
      error: message,
      jobId: jobStatus.id,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
