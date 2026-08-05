// app/api/test-tranzact/route.ts

import { NextResponse } from "next/server"
import { syncTranzactPurchaseOrders } from "@/lib/tranzact-purchase-order-sync"

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const result = await syncTranzactPurchaseOrders()
        return NextResponse.json({
            success: true,
            ...result,
        })

    } catch (error) {
        console.error("Error in test-tranzact API:", error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        )
    }
}
