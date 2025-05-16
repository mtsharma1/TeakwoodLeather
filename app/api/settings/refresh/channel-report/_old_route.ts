// import { fetchCSV, pollJobStatus } from "@/action/csv"
// import { NextResponse } from "next/server"
// import { createChannelItemReportJob } from "@/lib/api"
// import prisma from "@/lib/prisma";
// import { channelItemReport } from "@prisma/client";

// interface ProductRecord {
//   'Channel Name': string;
//   'Uniware Sku Code': string;
//   'Status Code': string;
//   'Seller Sku Code': string;
//   sellerSku: string;
// }

// interface ChannelData {
//   [channel: string]: number;
// }

// interface OutputData {
//   [sku: string]: ChannelData & {
//     category: string;
//     available_inventory: number;
//     unlink_count: number;
//   };
// }

// const ALLOWED_CHANNELS = [
//   "AJIO_DROPSHIP",
//   "AMAZON_IN_API",
//   "cocoblu",
//   "CRED",
//   "FLIPKART",
//   "MYNTRAPPMP",
//   "NYKAA_COM",
//   "NYKAA_FASHION",
//   "SHOPIFY",
//   "TATACLIQ",
// ];

// const EXCLUDED_CATEGORY = [
//   'COMBOS',
//   'APSIS COMBO',
//   'TEAKWOOD BUCKLE'
// ]

// const processJsonData = async (jsonData: ProductRecord[]): Promise<OutputData> => {
//   const outputData: OutputData = {};
//   const uniqueChannels: Set<string> = new Set();

//   // Get all unique seller SKUs
//   const skus = new Set(jsonData.map(row => row['Uniware Sku Code']?.trim()).filter(Boolean));

//   // Fetch inventory and category data for all SKUs at once
//   const monthlyData = await prisma.monthDataItem.findMany({
//     where: {
//       skuCode: {
//         in: Array.from(skus)
//       }
//     },
//     select: {
//       skuCode: true,
//       categoryName: true,
//       availableInventory: true
//     }
//   });

//   // Create a map for quick lookup
//   const skuDataMap = new Map(monthlyData.map(item => [item.skuCode, item]));

//   for (const row of jsonData) {
//     const channel = row['Channel Name']?.trim();
//     const sku = row['Uniware Sku Code']?.trim();
//     const sellerSkuCode = row['Seller Sku Code']?.trim();

//     if (!ALLOWED_CHANNELS.includes(channel || "")) continue;

//     uniqueChannels.add(channel);

//     if (!outputData[sku]) {
//       const monthlyItem = skuDataMap.get(sku);
//       if (monthlyItem?.categoryName && EXCLUDED_CATEGORY.includes(monthlyItem?.categoryName)) {
//         continue;
//       }
//       outputData[sku] = {
//         category: monthlyItem?.categoryName || '',
//         available_inventory: parseInt(monthlyItem?.availableInventory || '0'),
//         unlink_count: 0
//       } as OutputData[string];
//     }

//     outputData[sku][channel] = (outputData[sku][channel] || 0) + 1;
//     outputData[sku].unlink_count = (outputData[sku].unlink_count || 0) + (sellerSkuCode === "" ? 1 : 0);
//   }

//   return outputData;
// };

// const generateOutputJson = (outputData: OutputData) => {
//   const sortedChannels = Array.from(new Set(Object.values(outputData).flatMap(obj => Object.keys(obj)))).sort()
//     .filter(key => !['category', 'available_inventory', 'unlink_count'].includes(key));

//   return Object.entries(outputData).map(([sku, channelData]) => {
//     // [09-04-2025] : uniware_sku_code is seller sku code 
//     const row: { [key: string]: string | number } = {
//       'uniware_sku_code': sku,
//       'category': channelData.category,
//       'available_inventory': channelData.available_inventory
//     };
//     let total = 0;

//     sortedChannels.forEach(channel => {
//       const count = channelData[channel] || 0;
//       row[channel?.toLowerCase()?.trim()?.replace(/[^a-z0-9_]/g, "_")] = count;
//       total += count;
//     });

//     row['grand_total'] = total;
//     row['unlink_count'] = channelData.unlink_count || 0;
//     return row;
//   });
// };

// // Separate background processing function
// async function processAndSaveChannelData(jobId: string, path: string) {
//   try {
//     // Update job status to processing
//     await prisma.jobStatus.update({
//       where: { id: jobId },
//       data: {
//         status: "processing",
//         progress: 10,
//         message: "Downloading and parsing CSV file..."
//       }
//     })

//     const rawData = await fetchCSV<ProductRecord>(path);

//     await prisma.jobStatus.update({
//       where: { id: jobId },
//       data: {
//         progress: 30,
//         message: "Clearing existing data..."
//       }
//     })

//     // Clear existing data
//     await prisma.channelItemReport.deleteMany({});

//     await prisma.jobStatus.update({
//       where: { id: jobId },
//       data: {
//         progress: 50,
//         message: "Processing channel data..."
//       }
//     })

//     // Process the data
//     const processedData = generateOutputJson(await processJsonData(rawData));

//     await prisma.jobStatus.update({
//       where: { id: jobId },
//       data: {
//         progress: 75,
//         message: "Saving channel data to database..."
//       }
//     })

//     // Save to database
//     await prisma.channelItemReport.createMany({
//       data: processedData,
//       skipDuplicates: true,
//     });

//     // Update job status to completed
//     await prisma.jobStatus.update({
//       where: { id: jobId },
//       data: {
//         status: "completed",
//         progress: 100,
//         message: "Channel report data processing completed successfully",
//         completedAt: new Date()
//       }
//     })

//     console.log("Channel report data processing and saving completed successfully");
//   } catch (error) {
//     console.error("Background channel report processing error:", error);

//     // Update job status to failed
//     await prisma.jobStatus.update({
//       where: { id: jobId },
//       data: {
//         status: "failed",
//         error: error instanceof Error ? error.message : String(error),
//         completedAt: new Date()
//       }
//     })
//   }
// }

// export async function GET() {
//   try {
//     // Create a new job status record
//     const jobStatus = await prisma.jobStatus.upsert({
//       where: {
//         jobType: "channel-report",
//       },
//       update: {
//         status: "pending",
//         message: "Creating channel report export job...",
//         startedAt: new Date(),
//       },
//       create: {
//         jobType: "channel-report",
//         status: "pending",
//         message: "Creating channel report export job..."
//       }
//     })

//     // Step 1: Create the export job
//     const jobResponse = await createChannelItemReportJob();

//     if (!jobResponse.successful) {
//       // Update job status to failed
//       await prisma.jobStatus.update({
//         where: { id: jobStatus.id },
//         data: {
//           status: "failed",
//           error: "Failed to create channel report export job",
//           completedAt: new Date()
//         }
//       })

//       return NextResponse.json({
//         success: false,
//         message: 'Failed to create channel report export job',
//         error: jobResponse,
//         jobId: jobStatus.id,
//         timestamp: new Date().toISOString()
//       }, { status: 500 });
//     }

//     const jobCode = jobResponse.jobCode;

//     // Update job status
//     await prisma.jobStatus.update({
//       where: { id: jobStatus.id },
//       data: {
//         message: "Waiting for export job to complete...",
//         progress: 5
//       }
//     })

//     // Step 2: Wait for the job to complete and get the file path
//     const result = await pollJobStatus(jobCode, 100, 2000 * 4);
//     const filePath = result.filePath;

//     // Update job status with file path
//     await prisma.jobStatus.update({
//       where: { id: jobStatus.id },
//       data: {
//         filePath,
//         message: "Export job completed, starting data processing...",
//         progress: 10
//       }
//     })

//     // Step 3: Return the response immediately with the file path
//     // While kicking off background processing
//     processAndSaveChannelData(jobStatus.id, filePath).catch(err =>
//       console.error("Failed in background channel report processing:", err)
//     );

//     // Return success response immediately with the file path
//     return NextResponse.json({
//       success: true,
//       message: 'Channel report data processing started',
//       filePath: filePath,
//       jobId: jobStatus.id,
//       note: 'Data processing continues in background',
//       timestamp: new Date().toISOString()
//     });

//   } catch (error) {
//     console.error('Channel report API execution failed:', error);
//     return NextResponse.json({
//       success: false,
//       message: 'Failed to process channel report data',
//       error: error instanceof Error ? error.message : String(error),
//       timestamp: new Date().toISOString()
//     }, { status: 500 });
//   }
// }