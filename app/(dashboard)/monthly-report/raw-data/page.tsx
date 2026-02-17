import { Suspense } from "react"
import { analysisData } from "@/action/csv"
import AdvancedInventoryTable from "@/components/advanced-inventory-table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import LoadingSkeleton from "@/components/loader/table-skelaton"

export const dynamic = 'force-dynamic'

export default async function OverviewMontlyReport() {
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="border-b">
        <CardTitle className="text-xl md:text-2xl font-bold capitalize">Raw Data</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <Suspense fallback={<LoadingSkeleton />}>
          <OverviewMontlyReportContent type={'overview'} />
        </Suspense>
      </CardContent>
    </Card>
  )
}

async function OverviewMontlyReportContent({ type }: { type: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await analysisData(type)

  return (
    <div className="space-y-4">
      {(data?.totalSale || data?.totalInventory )&& <div className="grid gap-4 sm:grid-cols-2 p-4">
        {data?.totalSale && (
          <div className="rounded-lg border p-3">
            <h2 className="text-sm font-medium text-muted-foreground">Total Sale</h2>
            <p className="text-2xl font-bold">{data.totalSale}</p>
          </div>
        )}
        {data?.totalInventory && (
          <div className="rounded-lg border p-3">
            <h2 className="text-sm font-medium text-muted-foreground">Total Inventory</h2>
            <p className="text-2xl font-bold">{data.totalInventory}</p>
          </div>
        )}
      </div>}
      <div className="relative w-full overflow-hidden">
        <AdvancedInventoryTable data={data.rows || data || []} columnNames={data?.cols || Object.keys(data?.[0]  || {})} filename={type} />
      </div>
    </div>
  )
}