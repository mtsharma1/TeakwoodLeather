import { analysisData } from "@/action/csv"
import AdvancedInventoryTable from "@/components/advanced-inventory-table"

export default async function OverStock({ params }: { params: { type: string } }) {
  const data = await analysisData(params.type)
  return (
    <main className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4 capitalize">{params.type}</h1>
      {data?.totalSale && <h1 className="text-lg font-bold mb-4 capitalize">Total Sale: {data.totalSale}</h1>}
      {data?.totalInventory && <h1 className="text-lg font-bold mb-4 capitalize">Total Inventory: {data.totalInventory}</h1>}
      <AdvancedInventoryTable
        data={data.rows || data || []}
        columnNames={data?.cols || Object.keys(data[0]) || {}}
      />
    </main>
  )
}

