export const dynamic = 'force-dynamic' // This forces the page to be dynamic
export const revalidate = 0 // This disables static page generation

import { categoryData } from "@/action/csv"
import { categorySizeMap } from "@/components/categories/data-table-filters"
import TableCard from "@/components/categories/table-card"

export default async function Category({ params }: { params: { type: string } }) {
  const key = params.type.replaceAll("-", "") as keyof typeof categorySizeMap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await categoryData(key)

  return (
    <main className="mx-auto">
      <h1 className="text-2xl font-bold mb-4 capitalize">{params.type}</h1>
      <TableCard data={data} key={key} />
    </main>
  )
}

