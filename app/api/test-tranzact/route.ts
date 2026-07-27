// app/api/test-tranzact/route.ts

import { NextResponse } from "next/server"
import { getPurchaseOrderRegisterReport } from "@/lib/api"
import { saveTranzactPurchaseOrderData } from "@/action/db_action"

export async function GET() {
    try {
        const results = await getPurchaseOrderRegisterReport()
        const saved = await saveTranzactPurchaseOrderData(results)
        // console.log("Tranzact Purchase Order Data saved:", saved.count, "rows")
        return NextResponse.json({
            success: true,
            fetchedCount: results.length,
            savedCount: saved.count,
            data: results
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
