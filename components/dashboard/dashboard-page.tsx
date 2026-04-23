import { Suspense } from "react"
import { DashboardCards } from "./dashboard-cards"
import { DashboardGraphs } from "./dashboard-graphs"
import { DashboardSkeleton } from "../loader/monthly-report-graph-loading"
import { DashboardTable } from "./dashboard-table"

export const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-[#ced5df] bg-[#eef2f7] px-5 py-3">
        <h1 className="text-[1.05rem] font-medium tracking-[0.04em] text-[#4b5565]">Dashboard</h1>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardCards />
        <DashboardTable />
        <DashboardGraphs />
      </Suspense>
    </div>
  )
}

