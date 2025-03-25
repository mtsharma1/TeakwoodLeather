import { cache, Suspense } from "react"
import { priceCheckListData } from "@/action/csv"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import LoadingSkeleton from "@/components/loader/table-skelaton"
import AnimatedTabs from "@/components/animated-route-tabs"
import AdvancedInventoryTable from "@/components/table/with-edit-advanced-inventory-table"

export const dynamic = 'force-dynamic'

const getCachedPriceCheckList = cache(async (type: string) => await priceCheckListData(type || "price-checklist"))

const tabs = [
  { name: "Overview", href: "/price-checklist/overview" },
  { name: "Analysis", href: "/price-checklist/analysis" },
  { name: "Stop", href: "/price-checklist/stop" },
  { name: "Under 300", href: "/price-checklist/under-300" },
]

export default async function PriceCheckList({ params }: { params: { type: string } }) {
  const key = params.type.replaceAll("-", "")
  return (
    <>
      <AnimatedTabs tabs={tabs} />
      <Card className="w-full overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-xl md:text-2xl font-bold capitalize">{params.type.replaceAll("-", " ")}</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <PriceCheckContent type={key} />
          </Suspense>
        </CardContent>
      </Card>
    </>
  )
}

async function PriceCheckContent({ type }: { type: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await getCachedPriceCheckList(type)

  return (
    <div className="space-y-4">
      {data?.totalSale && (
        <div className="grid gap-4 sm:grid-cols-2 p-4">
          <div className="rounded-lg border p-3">
            <h2 className="text-sm font-medium text-muted-foreground">Total Sale</h2>
            <p className="text-2xl font-bold">{data.totalSale}</p>
          </div>
        </div>
      )}
      <div className="relative w-full overflow-hidden">
        <AdvancedInventoryTable data={data.rows || data || []} columnNames={data.cols || Object.keys(data?.[0] || {})} filename={type} />
      </div>
    </div>
  )
}