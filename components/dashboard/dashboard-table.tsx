import { Suspense } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { categoryPortalData, priceCheckListData } from "@/action/csv"
import AdvancedInventoryTable from "../advanced-inventory-table"
import LoadingSkeleton from "../loader/table-skelaton"

export const dynamic = 'force-dynamic'

export async function DashboardTable() {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const stop_data: any = await priceCheckListData("stop")
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const portal_data: any = await categoryPortalData("portal")
   const STOP_COLS = ["Invoice Created Date", "Multiple Price", "SKU Code", "Total Selling Price"]


   return (
      <div className="grid gap-6 md:grid-cols-2">
         <Card className="w-full overflow-hidden">
            <CardHeader className="border-b">
               <CardTitle className="text-xl md:text-2xl font-bold capitalize">Price Checklist</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
               <Suspense fallback={<LoadingSkeleton />}>
                  <AdvancedInventoryTable
                     data={stop_data.rows || stop_data || []}
                     columnNames={STOP_COLS}
                     filename={"stop"}
                     pageSizeParam={9}
                     showTools={false}
                  />
               </Suspense>
            </CardContent>
         </Card>
         <Card className="w-full overflow-hidden">
            <CardHeader className="border-b">
               <CardTitle className="text-xl md:text-2xl font-bold capitalize">Daily Sales Report</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
               <Suspense fallback={<LoadingSkeleton />}>
                  <AdvancedInventoryTable
                     data={portal_data.metrics || []}
                     columnNames={Object.keys(portal_data.metrics[0] || {})}
                     filename={"portal"}
                     showTools={false}
                  />

               </Suspense>
            </CardContent>
         </Card>
      </div>
   )
}