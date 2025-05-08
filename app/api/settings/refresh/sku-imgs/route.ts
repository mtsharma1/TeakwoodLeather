import type { ProductData } from "@/types/order"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { NextResponse } from "next/server"
import { createItemMasterDropboxJob } from "@/lib/api"
import { saveProductsOptimally } from "@/action/db_action";
import prisma from "@/lib/prisma";

// Separate background processing function
async function processAndSaveProductData(jobId: string, path: string) {
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

    const rawData = await fetchCSV<ProductData>(path)
    
    await prisma.jobStatus.update({
      where: { id: jobId },
      data: { 
        progress: 50,
        message: "Saving product data to database..."
      }
    })
    
    await saveProductsOptimally(rawData)
    
    // Update job status to completed
    await prisma.jobStatus.update({
      where: { id: jobId },
      data: { 
        status: "completed", 
        progress: 100,
        message: "Product data processing completed successfully",
        completedAt: new Date()
      }
    })
    
    console.log("Product data processing and saving completed successfully")
  } catch (error) {
    console.error("Background product processing error:", error)
    
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
        jobType: "sku-imgs",
      },
      update: {
        status: "pending",
        message: "Creating SKU dropbox export job...",
        startedAt: new Date(),
      },
      create: {
        jobType: "sku-imgs",
        status: "pending",
        message: "Creating SKU dropbox export job..."
      }
    })

    // Step 1: Create the export job
    const jobResponse = await createItemMasterDropboxJob()

    if (!jobResponse.successful) {
      // Update job status to failed
      await prisma.jobStatus.update({
        where: { id: jobStatus.id },
        data: { 
          status: "failed", 
          error: "Failed to create SKU dropbox export job",
          completedAt: new Date()
        }
      })
      
      return NextResponse.json({
        success: false,
        message: 'Failed to create SKU dropbox export job',
        error: jobResponse,
        jobId: jobStatus.id,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
    const jobCode = jobResponse.jobCode
    
    // Update job status
    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: { 
        message: "Waiting for export job to complete...",
        progress: 5
      }
    })
    
    // Step 2: Wait for the job to complete and get the file path
    const result = await pollJobStatus(jobCode, 100, 2000 * 4)
    const filePath = result.filePath
    
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
    processAndSaveProductData(jobStatus.id, filePath).catch(err => 
      console.error("Failed in background product processing:", err)
    )
    
    // Return success response immediately with the file path
    return NextResponse.json({
      success: true,
      message: 'SKU dropbox data processing started',
      filePath: filePath,
      jobId: jobStatus.id,
      note: 'Data processing continues in background',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('SKU dropbox API execution failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to process SKU dropbox data',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}