"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calculateCategoryMonthlyReport, calculatePoralMonthlyReport } from "@/action/csv"
import { ProductQuantity } from "@/types/category-poral-monthly"
import AdvancedInventoryTable from "../advanced-inventory-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

function SubmitButton() {
   const { pending } = useFormStatus()
   return (
      <Button type="submit" disabled={pending}>
         {pending ? "Uploading..." : "Upload CSV"}
      </Button>
   )
}

export function CSVUploadForm() {
   const [categoryReport, setCategoryReport] = useState<ProductQuantity[] | null>(null)
   const [poralReport, setPoralReport] = useState<ProductQuantity[] | null>(null)

   async function handleSubmit(formData: FormData) {
      const cat_report = await calculateCategoryMonthlyReport(formData)
      const poral_report = await calculatePoralMonthlyReport(formData)
      setPoralReport(poral_report)
      setCategoryReport(cat_report)
   }

   return (
      <>
         <div>
            <form action={handleSubmit} className="flex items-end gap-2">
               <div className="space-y-2">
                  <Label htmlFor="file">Upload Tally Report</Label>
                  <Input type="file" id="file" name="file" accept=".csv" required />
               </div>
               <SubmitButton />
            </form>
         </div>
         <Tabs defaultValue="category_monthly_report" className="w-ful mt-6">
            <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger value="category_monthly_report">Category</TabsTrigger>
               <TabsTrigger value="poral_monthly_report">Poral</TabsTrigger>
            </TabsList>
            <TabsContent value="category_monthly_report">
               {categoryReport ? <div className="relative w-full overflow-hidden mt-3">
                  <AdvancedInventoryTable
                     data={categoryReport || []}
                     columnNames={Object.keys(categoryReport[0] || {})}
                     filename={'Monthly Report'}
                  />
               </div> : <>No data found!</>}
            </TabsContent>
            <TabsContent value="poral_monthly_report">
               {poralReport ? <div className="relative w-full overflow-hidden mt-3">
                  <AdvancedInventoryTable
                     data={poralReport || []}
                     columnNames={Object.keys(poralReport[0] || {})}
                     filename={'Monthly Report'}
                  />
               </div> : <>No data found!</>}
            </TabsContent>
         </Tabs>
      </>
   )
}

