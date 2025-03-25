import { Suspense } from "react"
import { SalesBarChart } from "./sales-bar-chart"
import { InventoryBarChart } from "./inventory-bar-chart"
// import { MonthlyReportDonutPieChart } from "./stocks-donut-pie"
import { analysisDasboard } from "@/action/csv"
import { GraphSkeleton } from "../loader/monthly-report-graph-loading"

export const dynamic = 'force-dynamic'

export async function DashboardGraphs() {
    const data = await analysisDasboard()

    return (
        <div className="grid gap-6 md:grid-cols-4">
            <Suspense fallback={<GraphSkeleton />}>
                <SalesBarChart data={data.graphs.bar} />
            </Suspense>
            <Suspense fallback={<GraphSkeleton />}>
                <InventoryBarChart data={data.graphs.bar} />
            </Suspense>
            {/* <Suspense fallback={<GraphSkeleton />}>
                <MonthlyReportDonutPieChart data={data.cards} />
            </Suspense> */}
        </div>
    )
}

