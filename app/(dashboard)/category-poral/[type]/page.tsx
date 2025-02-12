import { cache, Suspense } from "react"
import { categoryPortalData } from "@/action/csv"
import AdvancedInventoryTable from "@/components/advanced-inventory-table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import LoadingSkeleton from "@/components/loader/table-skelaton"

export const dynamic = 'force-dynamic'

const getCachedCategoryPortal = cache(async (type: string) => await categoryPortalData(type))

export default async function CategoryPortalPage({ params }: { params: { type: string } }) {
  const key = params.type.replaceAll("-", "")
  return (
    <>
      <Card className="w-full overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-xl md:text-2xl font-bold capitalize">{params.type.replaceAll("-", " ")}</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <CategoryPortalContent type={key} />
          </Suspense>
        </CardContent>
      </Card>
    </>
  )
}

async function CategoryPortalContent({ type }: { type: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await getCachedCategoryPortal(type)

  return (
    <div className="space-y-4">
      <div className="relative w-full overflow-hidden">
        <AdvancedInventoryTable data={data.rows || data || []} columnNames={data.cols || Object.keys(data[0] || {})} filename={type} />
      </div>
    </div>
  )
}