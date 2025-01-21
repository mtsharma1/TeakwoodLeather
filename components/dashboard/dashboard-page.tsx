import { Suspense } from "react"
import { DashboardCards } from "./dashboard-cards"
import { DashboardGraphs } from "./dashboard-graphs"
import { DashboardSkeleton } from "../loader/monthly-report-graph-loading"

export const DashboardPage = () => {
  return (
    <div className="space-y-4">
      <Suspense fallback={<DashboardSkeleton />}>
          <DashboardCards />
        <DashboardGraphs />
      </Suspense>
    </div>
  )
}

