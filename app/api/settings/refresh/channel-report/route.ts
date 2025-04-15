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

interface ChannelData {
  [channel: string]: number;
}

interface OutputData {
  [sku: string]: ChannelData & {
    category: string;
    available_inventory: number;
    unlink_count: number;
  };
}

const ALLOWED_CHANNELS = [
  "AJIO_DROPSHIP",
  "AMAZON_IN_API",
  "cocoblu",
  "CRED",
  "FLIPKART",
  "MYNTRAPPMP",
  "NYKAA_COM",
  "NYKAA_FASHION",
  "SHOPIFY",
  "TATACLIQ",
];

const EXCLUDED_CATEGORY = [
  'COMBOS',
  'APSIS COMBO',
  'TEAKWOOD BUCKLE'
]

const processJsonData = async (jsonData: ProductRecord[]): Promise<OutputData> => {
  const outputData: OutputData = {};
  const uniqueChannels: Set<string> = new Set();

  // Get all unique seller SKUs
  const skus = new Set(jsonData.map(row => row['Uniware Sku Code']?.trim()).filter(Boolean));

  // Fetch inventory and category data for all SKUs at once
  const monthlyData = await prisma.monthDataItem.findMany({
    where: {
      skuCode: {
        in: Array.from(skus)
      }
    },
    select: {
      skuCode: true,
      categoryName: true,
      availableInventory: true
    }
  });

  // Create a map for quick lookup
  const skuDataMap = new Map(monthlyData.map(item => [item.skuCode, item]));

  for (const row of jsonData) {
    const channel = row['Channel Name']?.trim();
    const sku = row['Uniware Sku Code']?.trim();
    const sellerSkuCode = row['Seller Sku Code']?.trim();

    if (!ALLOWED_CHANNELS.includes(channel || "")) continue;

    uniqueChannels.add(channel);

    if (!outputData[sku]) {
      const monthlyItem = skuDataMap.get(sku);
      if (monthlyItem?.categoryName && EXCLUDED_CATEGORY.includes(monthlyItem?.categoryName)) {
        continue;
      }
      outputData[sku] = {
        category: monthlyItem?.categoryName || '',  
        available_inventory: parseInt(monthlyItem?.availableInventory || '0'),
        unlink_count: 0
      } as OutputData[string];
    }

    outputData[sku][channel] = (outputData[sku][channel] || 0) + 1;
    outputData[sku].unlink_count = (outputData[sku].unlink_count || 0) + (sellerSkuCode === sku ? 1 : 0);
  }

  return outputData;
};

const generateOutputJson = (outputData: OutputData) => {
  const sortedChannels = Array.from(new Set(Object.values(outputData).flatMap(obj => Object.keys(obj)))).sort()
    .filter(key => !['category', 'available_inventory', 'unlink_count'].includes(key));

  return Object.entries(outputData).map(([sku, channelData]) => {
    // [09-04-2025] : uniware_sku_code is seller sku code 
    const row: { [key: string]: string | number } = {
      'uniware_sku_code': sku,
      'category': channelData.category,
      'available_inventory': channelData.available_inventory
    };
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

    const processedData = generateOutputJson(await processJsonData(rawData))

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