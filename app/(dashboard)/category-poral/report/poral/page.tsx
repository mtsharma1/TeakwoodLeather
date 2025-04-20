import { cache, Suspense } from "react"
import { categoryPortalData } from "@/action/csv"
import AdvancedInventoryTable from "@/components/advanced-inventory-table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import LoadingSkeleton from "@/components/loader/table-skelaton"

export const dynamic = 'force-dynamic'

const getCachedCategoryPortal = cache(async () => await categoryPortalData("portal"))

export default async function PortalPage() {
  return (
    <>
      <Card className="w-full overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-xl md:text-2xl font-bold capitalize">Portal</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <PortalContent />
          </Suspense>
        </CardContent>
      </Card>
    </>
  )
}

async function PortalContent() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await getCachedCategoryPortal()
  return (
    <div className="space-y-4">
      {/* <div className="grid gap-4 sm:grid-cols-2 p-4">
        {data?.totalSale && (
          <div className="rounded-lg border p-3">
            <h2 className="text-sm font-medium text-muted-foreground">Total Sale</h2>
            <p className="text-2xl font-bold">{data.totalSale}</p>
          </div>
        )}
      </div> */}
      <div className="relative w-full overflow-hidden">
        <AdvancedInventoryTable data={data.metrics|| []} columnNames={Object.keys(data.metrics[0] || {})} filename={"portal"} totalData={data.totals}/>
      </div>
    </div>
  )
}