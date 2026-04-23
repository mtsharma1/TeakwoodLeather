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
   const STOP_COLS = ["SKU Code", "Multiple Price", "Channel Name", "Total Selling Price", "Cost Price", "Grade"]


   return (
      <div className="grid gap-6 md:grid-cols-2">
         <Card className="w-full overflow-hidden rounded-sm border border-[#cfd6e0] bg-white shadow-none transition-all duration-200 hover:border-[#8fb0e6] hover:shadow-[0_4px_14px_-8px_rgba(37,99,235,0.45)]">
            <CardHeader className="border-b border-[#d6dde7] bg-[#f4f6fa]">
               <CardTitle className="text-[1.05rem] font-semibold tracking-[0.08em] text-[#3f4a5c] uppercase">Stop Only</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
               <Suspense fallback={<LoadingSkeleton />}>
                  <AdvancedInventoryTable
                     data={stop_data.rows || stop_data || []}
                     columnNames={STOP_COLS}
                     filename={"stop"}
                     pageSizeParam={9}
                  />
               </Suspense>
            </CardContent>
         </Card>
         <Card className="w-full overflow-hidden rounded-sm border border-[#cfd6e0] bg-white shadow-none transition-all duration-200 hover:border-[#8fb0e6] hover:shadow-[0_4px_14px_-8px_rgba(37,99,235,0.45)]">
            <CardHeader className="border-b border-[#d6dde7] bg-[#f4f6fa]">
               <CardTitle className="text-[1.05rem] font-semibold tracking-[0.08em] text-[#3f4a5c] uppercase">Daily Sales Report</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
               <Suspense fallback={<LoadingSkeleton />}>
                  <AdvancedInventoryTable
                     data={portal_data.metrics || []}
                     totalData={portal_data.totals || []}
                     columnNames={Object.keys(portal_data.metrics[0] || {})}
                     filename={"portal"}
                  />

               </Suspense>
            </CardContent>
         </Card>
      </div>
   )
}
