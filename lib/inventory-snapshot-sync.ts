import type { Prisma } from "@prisma/client"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { createInventorySnapshotJob } from "@/lib/api"
import prisma from "@/lib/prisma"

type ProgressCallback = (progress: number, message: string) => Promise<void> | void
type SnapshotRow = Record<string, string | number | boolean | null | undefined>

function normalizeKey(key: string) {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase()
}

function rowReader(row: SnapshotRow) {
  const values = new Map(Object.entries(row).map(([key, value]) => [normalizeKey(key), value]))
  const get = (...keys: string[]) => {
    for (const key of keys) {
      const value = values.get(normalizeKey(key))
      if (value !== undefined && value !== null) return value
    }
    return ""
  }
  const text = (...keys: string[]) => String(get(...keys)).trim()
  const number = (...keys: string[]) => {
    const raw = text(...keys).replace(/,/g, "").replace(/^\((.*)\)$/, "-$1")
    const value = Number(raw)
    return Number.isFinite(value) ? value : 0
  }
  const boolean = (...keys: string[]) => ["true", "yes", "1", "enabled"].includes(text(...keys).toLowerCase())

  return { text, number, boolean }
}

function transformRow(row: SnapshotRow): Prisma.InventorySnapshotCreateManyInput {
  const value = rowReader(row)

  return {
    facility: value.text("facility"),
    itemTypeName: value.text("itemTypeName", "Item Type Name"),
    itemTypeSku: value.text("itemtypeSku", "Item Type SKU", "Item SkuCode", "SKU Code"),
    ean: value.text("ean"),
    upc: value.text("upc"),
    isbn: value.text("isbn"),
    color: value.text("color"),
    size: value.text("size"),
    brand: value.text("brand"),
    categoryName: value.text("categoryName", "Category Name"),
    mrp: value.number("MRP"),
    openSale: value.number("openSale", "Open Sale"),
    inventory: value.number("inventory"),
    quantityNotFound: value.number("quantityNotFound", "Quantity Not Found"),
    excessQuantity: value.number("excessQuantity", "Excess Quantity"),
    quarantinedInventory: value.number("quarantinedInventory", "Quarantined Inventory"),
    inventoryNotSynced: value.number("inventoryNotSynced", "Inventory Not Synced"),
    inventoryBlocked: value.number("inventoryBlocked", "Inventory Blocked"),
    badInventory: value.number("badInventory", "Bad Inventory"),
    putawayPending: value.number("putawayPending", "Putaway Pending"),
    pendingInventoryAssessment: value.number("pendingInventoryAssessment", "Pending Inventory Assessment"),
    pendingStockTransfer: value.number("pendingStockTransfer", "Pending Stock Transfer"),
    openPurchase: value.number("openPurchase", "Open Purchase"),
    enabled: value.boolean("enabled"),
    sourceUpdatedAt: value.text("updated"),
    costPrice: value.number("costPrice", "Cost Price"),
    closureType: value.text("itemType_closuer_Type", "Closure Type"),
    gender: value.text("itemType_Gender", "Gender"),
    grade: value.text("itemType_Grade", "Grade"),
    manufacturer: value.text("itemType_man", "Manufacturer"),
    materialType: value.text("itemType_material_Type", "Material Type"),
    monthGrade: value.text("itemType_month_Grade", "Month Grade"),
    parentSku: value.text("itemType_ParentSku", "Parent SKU"),
    patternType: value.text("itemType_pat_type", "Pattern Type"),
    productTitle: value.text("itemType_product_Title", "Product Title"),
    sellingPrice: value.number("itemType_selling_Price", "Selling Price"),
    serialNumber: value.text("itemType_sno_Number", "Serial Number"),
    itemStatus: value.text("itemType_Status", "Status"),
    subcategory: value.text("itemType_subcategory", "Subcategory"),
    url1: value.text("itemType_url1", "URL 1"),
    url2: value.text("itemType_url2", "URL 2"),
    url3: value.text("itemType_url3", "URL 3"),
    url4: value.text("itemType_url4", "URL 4"),
    url5: value.text("itemType_url5", "URL 5"),
    url6: value.text("itemType_url6", "URL 6"),
    url7: value.text("itemType_url7", "URL 7"),
    url8: value.text("itemType_url8", "URL 8"),
    vendorName: value.text("itemType_vendor_Name", "Vendor Name"),
    vendorPrice: value.number("itemType_vendor_Price", "Vendor Price"),
    volume: value.text("itemType_vol", "Volume"),
    rowData: JSON.parse(JSON.stringify(row)) as Prisma.InputJsonValue,
  }
}

export async function syncInventorySnapshot(onProgress?: ProgressCallback) {
  await onProgress?.(10, "Creating inventory snapshot export job...")
  const jobResponse = await createInventorySnapshotJob()

  if (!jobResponse?.successful || !jobResponse?.jobCode) {
    throw new Error(`Failed to create inventory snapshot export job: ${JSON.stringify(jobResponse)}`)
  }

  await onProgress?.(20, "Waiting for inventory snapshot export to complete...")
  const exportResult = await pollJobStatus(jobResponse.jobCode, 140, 2000)

  if (!exportResult.filePath) {
    throw new Error("Inventory snapshot export completed without a CSV file path")
  }

  await onProgress?.(45, "Downloading and parsing inventory snapshot CSV...")
  const rawRows = await fetchCSV<SnapshotRow>(exportResult.filePath)

  if (rawRows.length === 0) {
    throw new Error("Inventory snapshot contained no rows; existing data was preserved")
  }

  await onProgress?.(65, `Transforming ${rawRows.length} inventory snapshot rows...`)
  const data = rawRows.map(transformRow)

  await onProgress?.(80, `Saving ${data.length} inventory snapshot rows and updating Raw Data...`)
  const [, saved, updatedRawDataCount] = await prisma.$transaction([
    prisma.inventorySnapshot.deleteMany(),
    prisma.inventorySnapshot.createMany({ data }),
    prisma.$executeRaw`
      UPDATE MonthDataItem AS rawData
      LEFT JOIN (
        SELECT
          UPPER(TRIM(itemTypeSku)) AS normalizedSku,
          SUM(inventory) AS inventory
        FROM InventorySnapshot
        WHERE TRIM(itemTypeSku) <> ''
        GROUP BY UPPER(TRIM(itemTypeSku))
      ) AS snapshot
        ON UPPER(TRIM(rawData.\`Sku Code\`)) = snapshot.normalizedSku
      SET rawData.\`Available Inventory\` = CAST(COALESCE(snapshot.inventory, 0) AS CHAR)
    `,
  ])

  if (saved.count !== data.length) {
    throw new Error(`Inventory snapshot transformed ${data.length} rows but saved ${saved.count}`)
  }

  return {
    filePath: exportResult.filePath,
    fetchedCount: rawRows.length,
    savedCount: saved.count,
    updatedRawDataCount,
  }
}
