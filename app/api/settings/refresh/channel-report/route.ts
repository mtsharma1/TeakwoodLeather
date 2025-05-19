import { fetchCSV, pollJobStatus } from "@/action/csv"
import { NextResponse } from "next/server"
import { createChannelItemReportJob } from "@/lib/api"
import prisma from "@/lib/prisma";
import { channelItemReport } from "@prisma/client";

interface ProductRecord {
  'Channel Name': string;
  'Product Name': string;
  'Uniware Sku Code': string;
  'Status Code': string;
  'Seller Sku Code': string;
  'Selling Price': string;
  'Max Retail Price': string;
  sellerSku: string;
}

const processJsonData = async (jsonData: ProductRecord[]) => {
  return jsonData.map(row => {
    const channel = row['Channel Name']?.trim();
    const sku = row['Uniware Sku Code']?.trim();
    const sellerSkuCode = row['Seller Sku Code']?.trim();
    const productName = row['Product Name']?.trim();

    if(row['Status Code'] === "LINKED") return null;

    return {
      uniware_sku_code: sku,
      channel_name: channel,
      product_name: productName,
      channel_product_id: sellerSkuCode,
      seller_sku_code: sellerSkuCode,
      status_code: row['Status Code'],
      selling_price: parseFloat(row['Selling Price'] || "0"),
      max_retail_price: parseFloat(row['Max Retail Price'] || "0"),
    };
  }).filter(Boolean) as channelItemReport[];

  // await prisma.channelItemReport.deleteMany({});
  // await prisma.channelItemReport.createMany({ data });
};

// Separate background processing function
async function processAndSaveChannelData(jobId: string, path: string) {
  try {
    // Update job status to processing
    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        status: "processing",
        progress: 10,
        message: "Downloading and parsing CSV file..."
      }
    })

    const rawData = await fetchCSV<ProductRecord>(path);

    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        progress: 30,
        message: "Clearing existing data..."
      }
    })

    // Clear existing data
    await prisma.channelItemReport.deleteMany({});

    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        progress: 50,
        message: "Processing channel data..."
      }
    })

    // Process the data
    const processedData = await processJsonData(rawData);

    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        progress: 75,
        message: "Saving channel data to database..."
      }
    })

    // Save to database
    await prisma.channelItemReport.createMany({
      data: processedData,
    });

    // Update job status to completed
    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        status: "completed",
        progress: 100,
        message: "Channel report data processing completed successfully",
        completedAt: new Date()
      }
    })

    console.log("Channel report data processing and saving completed successfully");
  } catch (error) {
    console.error("Background channel report processing error:", error);

    // Update job status to failed
    await prisma.jobStatus.update({
      where: { id: jobId },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date()
      }
    })
  }
}

export async function GET() {
  try {
    // Create a new job status record
    const jobStatus = await prisma.jobStatus.upsert({
      where: {
        jobType: "channel-report",
      },
      update: {
        status: "pending",
        message: "Creating channel report export job...",
        startedAt: new Date(),
      },
      create: {
        jobType: "channel-report",
        status: "pending",
        message: "Creating channel report export job..."
      }
    })

    // Step 1: Create the export job
    const jobResponse = await createChannelItemReportJob();

    if (!jobResponse.successful) {
      // Update job status to failed
      await prisma.jobStatus.update({
        where: { id: jobStatus.id },
        data: {
          status: "failed",
          error: "Failed to create channel report export job",
          completedAt: new Date()
        }
      })

      return NextResponse.json({
        success: false,
        message: 'Failed to create channel report export job',
        error: jobResponse,
        jobId: jobStatus.id,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const jobCode = jobResponse.jobCode;

    // Update job status
    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        message: "Waiting for export job to complete...",
        progress: 5
      }
    })

    // Step 2: Wait for the job to complete and get the file path
    const result = await pollJobStatus(jobCode, 100, 2000 * 4);
    const filePath = result.filePath;

    // Update job status with file path
    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        filePath,
        message: "Export job completed, starting data processing...",
        progress: 10
      }
    })

    // Step 3: Return the response immediately with the file path
    // While kicking off background processing
    processAndSaveChannelData(jobStatus.id, filePath).catch(err =>
      console.error("Failed in background channel report processing:", err)
    );

    // Return success response immediately with the file path
    return NextResponse.json({
      success: true,
      message: 'Channel report data processing started',
      filePath: filePath,
      jobId: jobStatus.id,
      note: 'Data processing continues in background',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Channel report API execution failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process channel report data',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}