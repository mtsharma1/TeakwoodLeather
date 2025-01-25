import { Suspense } from 'react'
import { analysisData } from "@/action/csv"
import AdvancedInventoryTable from "@/components/advanced-inventory-table"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import LoadingSkeleton from '@/components/loader/table-skelaton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OverStock({ params }: { params: { type: string } }) {
  return (
    <Card className="w-full xl:max-w-[1500px] mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold capitalize">{params.type.replaceAll("-", " ")}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Suspense fallback={<LoadingSkeleton/>}>
          <OverStockContent type={params.type} />
        </Suspense>
      </CardContent>
    </Card>
  )
}

async function OverStockContent({ type }: { type: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data : any = await analysisData(type)

  return (
    <>
      {data?.totalSale && <h1 className="text-lg font-bold mb-4 capitalize">Total Sale: {data.totalSale}</h1>}
      {data?.totalInventory && <h1 className="text-lg font-bold mb-4 capitalize">Total Inventory: {data.totalInventory}</h1>}
      <AdvancedInventoryTable
        data={data.rows || data || []}
        columnNames={data?.cols || Object.keys(data[0]) || {}}
      />
    </>
  )
}

