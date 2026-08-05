import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { syncTranzactPurchaseOrders } from "@/lib/tranzact-purchase-order-sync"

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function GET() {
  const jobStatus = await prisma.jobStatus.upsert({
    where: { jobType: "tranzact-purchase-order" },
    update: {
      status: "processing",
      progress: 5,
      message: "Starting manual Tranzact purchase order sync...",
      error: null,
      completedAt: null,
      startedAt: new Date(),
    },
    create: {
      jobType: "tranzact-purchase-order",
      status: "processing",
      progress: 5,
      message: "Starting manual Tranzact purchase order sync...",
      startedAt: new Date(),
    },
  })

  try {
    const result = await syncTranzactPurchaseOrders(async (progress, message) => {
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
        message: `Tranzact purchase orders refreshed successfully (${result.savedCount} rows)`,
        error: null,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Tranzact purchase orders refreshed successfully",
      jobId: jobStatus.id,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Manual Tranzact purchase order refresh failed:", error)
    const message = error instanceof Error ? error.message : String(error)

    await prisma.jobStatus.update({
      where: { id: jobStatus.id },
      data: {
        status: "failed",
        progress: 0,
        message: "Tranzact purchase order refresh failed",
        error: message,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: false,
      message: "Failed to refresh Tranzact purchase orders",
      error: message,
      jobId: jobStatus.id,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
