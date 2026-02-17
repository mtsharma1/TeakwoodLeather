import { categoryData } from "@/action/csv"
import { categorySizeMap } from "@/components/categories/data-table-filters"
import TableCard from "@/components/categories/table-card"
import LoadingSkeleton from "@/components/loader/table-skelaton";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Suspense } from "react";

export default async function Category({ params }: { params: { type: string } }) {
  const key = params.type.replaceAll("-", "") as keyof typeof categorySizeMap
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await categoryData(key)

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="border-b">
        <CardTitle className="text-xl md:text-2xl font-bold capitalize">{params.type.replaceAll("-", " ")}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <Suspense fallback={<LoadingSkeleton />}>
          <TableCard data={data} key={key} />
        </Suspense>
      </CardContent>
    </Card>
  )
}