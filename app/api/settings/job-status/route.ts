import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobType = searchParams.get("jobType")
    
    if (!jobType) {
      return NextResponse.json({
        success: false,
        message: "Job type parameter is required",
      }, { status: 400 })
    }
    
    // Get the latest job status for this job type
    const jobStatus = await prisma.jobStatus.findFirst({
      where: { jobType },
      orderBy: { startedAt: "desc" }
    })
    
    if (!jobStatus) {
      return NextResponse.json({
        success: false,
        message: "No job status found for this type",
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: jobStatus,
    })
    
  } catch (error) {
    console.error("Error fetching job status:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to fetch job status",
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, status, progress, message, error, completedAt } = body
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Job ID is required",
      }, { status: 400 })
    }
    
    // Update job status
    const updatedJob = await prisma.jobStatus.update({
      where: { id },
      data: {
        status: status || undefined,
        progress: progress !== undefined ? progress : undefined,
        message: message || undefined,
        error: error || undefined,
        completedAt: completedAt ? new Date(completedAt) : undefined,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedJob,
    })
    
  } catch (error) {
    console.error("Error updating job status:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to update job status",
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
} 