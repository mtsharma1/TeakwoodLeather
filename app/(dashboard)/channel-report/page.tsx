import { cache, Suspense } from "react"
import { getChannelItemTypeReport } from "@/action/csv"
import AdvancedInventoryTable from "@/components/advanced-inventory-table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import LoadingSkeleton from "@/components/loader/table-skelaton"

export const dynamic = 'force-dynamic'

const getCachedChannelReport = cache(async () => await getChannelItemTypeReport())

export default async function PortalPage() {
  return (
    <>
      <Card className="w-full overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-xl md:text-2xl font-bold capitalize">Channel Report</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <ChannelReportPage />
          </Suspense>
        </CardContent>
      </Card>
    </>
  )
}

async function ChannelReportPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await getCachedChannelReport()

  return (
    <div className="space-y-4">
      <div className="relative w-full overflow-hidden">
        <AdvancedInventoryTable
          data={data || []}
          columnNames={Object.keys(data?.[0] || {})}
          filename={"channel-report"}
        />
      </div>
    </div>
  )
}