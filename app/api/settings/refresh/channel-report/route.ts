import { fetchCSV, pollJobStatus } from "@/action/csv"
import { NextResponse } from "next/server"
import { createChannelItemReportJob } from "@/lib/api"
import prisma from "@/lib/prisma";
import { channelItemReport } from "@prisma/client";

interface ProductRecord {
  'Channel Name': string;
  'Uniware Sku Code': string;
  'Status Code': string;
  'Seller Sku Code': string;
  sellerSku: string;
}

interface OutputData {
  [sku: string]: { [channel: string]: number };
}

const ALLOWED_CHANNELS = [
  "AJIO_DROPSHIP",
  "AJIO_DROPSHIP_suitcase",
  "AMAZON_IN_API",
  "cocoblu",
  "CRED",
  "CRED-APSIS",
  "FLIPKART",
  "MYNTRAPPMP",
  "NYKAA_COM",
  "NYKAA_FASHION",
  "SHOPIFY",
  "TATACLIQ",
];

const processJsonData = (jsonData: ProductRecord[]): OutputData => {
  const outputData: OutputData = {};
  const uniqueChannels: Set<string> = new Set();

  jsonData.forEach(row => {
    const channel = row['Channel Name']?.trim();
    // const sku = row['Uniware Sku Code']?.trim();
    const sellerSku = row['Seller Sku Code']?.trim();
    const statusCode = row['Status Code']?.trim();

    if (!ALLOWED_CHANNELS.includes(channel || "")) return

    uniqueChannels.add(channel);

    if (!outputData[sellerSku]) {
      outputData[sellerSku] = {};
    }

    outputData[sellerSku][channel] = (outputData[sellerSku][channel] || 0) + 1;
    outputData[sellerSku].unlink_count = (outputData[sellerSku].unlink_count || 0) + (statusCode === "UNLINKED" ? 1 : 0);
  });

  return outputData;
};

const generateOutputJson = (outputData: OutputData) => {
  const sortedChannels = Array.from(new Set(Object.values(outputData).flatMap(obj => Object.keys(obj)))).sort();

  return Object.entries(outputData).map(([sku, channelData]) => {
    // [09-04-2025] : uniware_sku_code is seller sku code 
    const row: { [key: string]: string | number } = { 'uniware_sku_code': sku }; 
    let total = 0;

    sortedChannels.forEach(channel => {
      const count = channelData[channel] || 0;
      row[channel?.toLowerCase()?.trim()?.replace(/[^a-z0-9_]/g, "_")] = count;
      total += count;
    });

    row['grand_total'] = total;
    row['unlink_count'] = channelData.unlink_count || 0;
    return row;
  });
};

async function fetchAndChannelReportData() {
  try {
    const jobResponse = await createChannelItemReportJob()

    if (!jobResponse.successful) {
      throw new Error(`Failed to create export job: ${JSON.stringify(jobResponse)}`)
    }
    const jobCode = jobResponse.jobCode

    const result = await pollJobStatus(jobCode, 100, 2000 * 4);
    const path = result.filePath
    const rawData = await fetchCSV<ProductRecord>(path)

    await prisma.channelItemReport.deleteMany({})

    const processedData = generateOutputJson(processJsonData(rawData))

    await prisma.channelItemReport.createMany({
      data: processedData as channelItemReport[],
      skipDuplicates: true,
    })

    return { success: true, filePath: path }
  } catch (error) {
    console.error("Error in ChannelReport:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function GET() {

  try {
    const result = await fetchAndChannelReportData();

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Failed to process channel report data',
        error: result.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Channel report data processed successfully',
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