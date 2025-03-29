import { fetchCSV, pollJobStatus } from "@/action/csv"
import { NextResponse } from "next/server"
import { unstable_noStore as noStore } from 'next/cache';
import { createChannelItemReportJob } from "@/lib/api"
import prisma from "@/lib/prisma";
import { channelItemReport } from "@prisma/client";

interface ProductRecord {
  'Channel Name': string;
  'Uniware Sku Code': string;
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
    const sku = row['Uniware Sku Code']?.trim();

    if (!ALLOWED_CHANNELS.includes(channel || "")) return

    uniqueChannels.add(channel);

    if (!outputData[sku]) {
      outputData[sku] = {};
    }

    outputData[sku][channel] = (outputData[sku][channel] || 0) + 1;
  });

  return outputData;
};

const generateOutputJson = (outputData: OutputData) => {
  const sortedChannels = Array.from(new Set(Object.values(outputData).flatMap(obj => Object.keys(obj)))).sort();

  return Object.entries(outputData).map(([sku, channelData]) => {
    const row: { [key: string]: string | number } = { 'uniware_sku_code': sku };
    let total = 0;

    sortedChannels.forEach(channel => {
      const count = channelData[channel] || 0;
      row[channel?.toLowerCase()?.trim()?.replace(/[^a-z0-9_]/g, "_")] = count;
      total += count;
    });

    row['grand_total'] = total;
    return row;
  });
};

async function fetchAndChannlReportData() {
  noStore();
  try {
    const jobResponse = await createChannelItemReportJob()
    console.log(jobResponse, "jobResponse")

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

    console.log('Save Channel Report data processing completed:', new Date().toISOString());
  } catch (error) {
    console.error("Error in ChannlReport:", error)
  }
}

export async function GET() {
  console.log('🔔 Cron triggered:', new Date().toISOString());

  (async () => {
    try {
      await fetchAndChannlReportData();
    } catch (error) {
      console.error('Background process failed: [ChannlReport]', error);
    }
  })();

  return NextResponse.json({
    success: true,
    message: 'Cron job scheduled successfully',
    timestamp: new Date().toISOString()
  });
}
