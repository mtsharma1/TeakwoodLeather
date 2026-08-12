import { Suspense } from "react"
import { unstable_noStore as noStore } from "next/cache"
import prisma from "@/lib/prisma"
import AdvancedInventoryTable from "@/components/advanced-inventory-table"
import LoadingSkeleton from "@/components/loader/table-skelaton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

const columns = [
  "Facility",
  "Item Type Name",
  "Item Type SKU",
  "EAN",
  "UPC",
  "ISBN",
  "Color",
  "Size",
  "Brand",
  "Category Name",
  "MRP",
  "Open Sale",
  "Inventory",
  "Quantity Not Found",
  "Excess Quantity",
  "Quarantined Inventory",
  "Inventory Not Synced",
  "Inventory Blocked",
  "Bad Inventory",
  "Putaway Pending",
  "Pending Inventory Assessment",
  "Pending Stock Transfer",
  "Open Purchase",
  "Enabled",
  "Updated",
  "Cost Price",
  "Closure Type",
  "Gender",
  "Grade",
  "Manufacturer",
  "Material Type",
  "Month Grade",
  "Parent SKU",
  "Pattern Type",
  "Product Title",
  "Selling Price",
  "Serial Number",
  "Status",
  "Subcategory",
  "URL 1",
  "URL 2",
  "URL 3",
  "URL 4",
  "URL 5",
  "URL 6",
  "URL 7",
  "URL 8",
  "Vendor Name",
  "Vendor Price",
  "Volume",
] as const

export default function InventorySnapshotPage() {
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="border-b">
        <CardTitle className="text-xl font-bold capitalize md:text-2xl">
          Inventory Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        <Suspense fallback={<LoadingSkeleton />}>
          <InventorySnapshotTable />
        </Suspense>
      </CardContent>
    </Card>
  )
}

async function InventorySnapshotTable() {
  noStore()
  const rows = await prisma.inventorySnapshot.findMany({
    orderBy: [{ categoryName: "asc" }, { itemTypeSku: "asc" }],
  })

  const data = rows.map((row) => ({
    "Facility": row.facility,
    "Item Type Name": row.itemTypeName,
    "Item Type SKU": row.itemTypeSku,
    "EAN": row.ean ?? "",
    "UPC": row.upc ?? "",
    "ISBN": row.isbn ?? "",
    "Color": row.color ?? "",
    "Size": row.size ?? "",
    "Brand": row.brand ?? "",
    "Category Name": row.categoryName ?? "",
    "MRP": String(row.mrp),
    "Open Sale": String(row.openSale),
    "Inventory": String(row.inventory),
    "Quantity Not Found": String(row.quantityNotFound),
    "Excess Quantity": String(row.excessQuantity),
    "Quarantined Inventory": String(row.quarantinedInventory),
    "Inventory Not Synced": String(row.inventoryNotSynced),
    "Inventory Blocked": String(row.inventoryBlocked),
    "Bad Inventory": String(row.badInventory),
    "Putaway Pending": String(row.putawayPending),
    "Pending Inventory Assessment": String(row.pendingInventoryAssessment),
    "Pending Stock Transfer": String(row.pendingStockTransfer),
    "Open Purchase": String(row.openPurchase),
    "Enabled": row.enabled ? "Yes" : "No",
    "Updated": row.sourceUpdatedAt ?? "",
    "Cost Price": String(row.costPrice),
    "Closure Type": row.closureType ?? "",
    "Gender": row.gender ?? "",
    "Grade": row.grade ?? "",
    "Manufacturer": row.manufacturer ?? "",
    "Material Type": row.materialType ?? "",
    "Month Grade": row.monthGrade ?? "",
    "Parent SKU": row.parentSku ?? "",
    "Pattern Type": row.patternType ?? "",
    "Product Title": row.productTitle ?? "",
    "Selling Price": String(row.sellingPrice),
    "Serial Number": row.serialNumber ?? "",
    "Status": row.itemStatus ?? "",
    "Subcategory": row.subcategory ?? "",
    "URL 1": row.url1 ?? "",
    "URL 2": row.url2 ?? "",
    "URL 3": row.url3 ?? "",
    "URL 4": row.url4 ?? "",
    "URL 5": row.url5 ?? "",
    "URL 6": row.url6 ?? "",
    "URL 7": row.url7 ?? "",
    "URL 8": row.url8 ?? "",
    "Vendor Name": row.vendorName ?? "",
    "Vendor Price": String(row.vendorPrice),
    "Volume": row.volume ?? "",
  }))

  return (
    <div className="relative w-full overflow-hidden">
      <AdvancedInventoryTable
        data={data}
        columnNames={[...columns]}
        filename="inventory-snapshot"
      />
    </div>
  )
}
