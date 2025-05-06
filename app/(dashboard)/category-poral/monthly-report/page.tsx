import { Suspense } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import LoadingSkeleton from "@/components/loader/table-skelaton"
import { CSVUploadForm } from "@/components/category-poral/upload-csv-form"

export const dynamic = 'force-dynamic'

export default async function CategoryPortalMonthlyReportPage() {
  return (
    <>
      <Card className="w-full overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="text-xl md:text-2xl font-bold capitalize">Tally Report</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <CSVUploadForm />
          </Suspense>
        </CardContent>
      </Card>
    </>
  )
}