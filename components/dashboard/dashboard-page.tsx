import { Suspense } from "react"
import { DashboardCards } from "./dashboard-cards"
import { DashboardGraphs } from "./dashboard-graphs"
import { DashboardSkeleton } from "../loader/monthly-report-graph-loading"
import { DashboardTable } from "./dashboard-table"

export const DashboardPage = () => {
  return (
    <div className="space-y-4">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardCards />
        <DashboardTable />
        <DashboardGraphs />
      </Suspense>
    </div>
  )
}

