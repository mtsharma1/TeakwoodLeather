import { Suspense } from "react"
import { analysisData } from "@/action/csv"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import LoadingSkeleton from "@/components/loader/table-skelaton"
import AdvancedInventoryTable from "@/components/table/with-edit-advanced-inventory-table"

// const getCachedAnalysisData = cache(async (type: string) => await analysisData(type))

export default async function OverStock({ params }: { params: { type: string } }) {
  const key = params.type.replaceAll("-", "")
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="border-b">
        <CardTitle className="text-xl md:text-2xl font-bold capitalize">{params.type.replaceAll("-", " ")}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <Suspense fallback={<LoadingSkeleton />}>
          <OverStockContent type={key} />
        </Suspense>
      </CardContent>
    </Card>
  )
}

async function OverStockContent({ type }: { type: string }) {
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