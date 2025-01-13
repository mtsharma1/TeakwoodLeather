export const dynamic = 'force-dynamic' // This forces the page to be dynamic
export const revalidate = 0 // This disables static page generation

import { analysisData } from "@/action/csv"
import AdvancedInventoryTable from "@/components/advanced-inventory-table"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function OverStock({ params }: { params: { type: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data : any = await analysisData(params.type)

  return (
    <Card className="w-full xl:max-w-[1600px] mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold capitalize">{params.type.replaceAll("-", " ")}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
      {data?.totalSale && <h1 className="text-lg font-bold mb-4 capitalize">Total Sale: {data.totalSale}</h1>}
      {data?.totalInventory && <h1 className="text-lg font-bold mb-4 capitalize">Total Inventory: {data.totalInventory}</h1>}
      <AdvancedInventoryTable
        data={data.rows || data || []}
        columnNames={data?.cols || Object.keys(data[0]) || {}}
      />
   </CardContent>
    </Card>
  )
}