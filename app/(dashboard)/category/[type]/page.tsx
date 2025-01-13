export const dynamic = 'force-dynamic' // This forces the page to be dynamic
export const revalidate = 0 // This disables static page generation

import { categoryData } from "@/action/csv"
import { categorySizeMap } from "@/components/categories/data-table-filters"
import TableCard from "@/components/categories/table-card"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function Category({ params }: { params: { type: string } }) {
  const key = params.type.replaceAll("-", "") as keyof typeof categorySizeMap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await categoryData(key)

  return (
    <Card className="w-full xl:max-w-[1600px] mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold capitalize">{params.type.replaceAll("-", " ")}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <TableCard data={data} key={key} />
      </CardContent>
    </Card>
  )
}