export const MONTHLY_REPORT_API_BODY = {
   "exportJobTypeName": "Monthly Order Report",
   "exportColums": [
      "skuCode",
      "parentSKU",
      "size",
      "category",
      "skuName",
      "saleQty",
      "saleAmount",
      "vendorName",
      "grade",
      "monthGrade",
      "inventory",
      "openPurchase",
      "b1",
      "b2",
      "b3",
      "vendorPrice",
      "totalAmount",
      "skuCodeid",
      "sdaoda"
   ],
   "exportFilters": [

   ],
   "frequency": "ONETIME"
}

export const CHANNEL_REPORT_API_BODY = {
   "exportJobTypeName": "Channel Item Type Report",
   "exportColums": [
      "channelName",
      "productName",
      "channelProductId",
      "sellerSkuCode",
      "uniwareSkuCode",
      "blockedInventory",
      "disabled",
      "sellingPrice",
      "mrp",
      "currencyCode",
      "statusCode",
      "nextInventoryUpdate",
      "lastInventoryUpdate"
   ],
   "exportFilters": [],
   "frequency": "ONETIME"
}

export const INVENTORY_SNAPSHOT_EXPORT_COLUMNS = [
   "facility",
   "itemTypeName",
   "itemtypeSku",
   "ean",
   "upc",
   "isbn",
   "color",
   "size",
   "brand",
   "categoryName",
   "MRP",
   "openSale",
   "inventory",
   "quantityNotFound",
   "excessQuantity",
   "quarantinedInventory",
   "inventoryNotSynced",
   "inventoryBlocked",
   "badInventory",
   "putawayPending",
   "pendingInventoryAssessment",
   "pendingStockTransfer",
   "openPurchase",
   "enabled",
   "updated",
   "costPrice",
   "itemType_closuer_Type",
   "itemType_Gender",
   "itemType_Grade",
   "itemType_man",
   "itemType_material_Type",
   "itemType_month_Grade",
   "itemType_ParentSku",
   "itemType_pat_type",
   "itemType_product_Title",
   "itemType_selling_Price",
   "itemType_sno_Number",
   "itemType_Status",
   "itemType_subcategory",
   "itemType_url1",
   "itemType_url2",
   "itemType_url3",
   "itemType_url4",
   "itemType_url5",
   "itemType_url6",
   "itemType_url7",
   "itemType_url8",
   "itemType_vendor_Name",
   "itemType_vendor_Price",
   "itemType_vol",
] as const

export function getInventorySnapshotApiBody() {
   return {
      exportJobTypeName: "Inventory Snapshot",
      exportColums: [...INVENTORY_SNAPSHOT_EXPORT_COLUMNS],
      exportFilters: [],
      frequency: "ONETIME",
   }
}

export const ITEM_MASTER_DROPBOX_API_BODY = {
   "exportJobTypeName": "Item Master",
   "exportColums": [
      "skuCode",
      "itemName",
      "color",
      "size",
      "brand",
      "tags",
      "imageUrl",
      "productPageUrl",
      "category",
      "type",
      "skuType",
      "itemType_month_Grade",
      "itemType_ParentSku",
      "itemType_product_Title",
      "itemType_url1",
      "itemType_url2",
      "itemType_url3",
      "itemType_url4",
      "itemType_url5",
      "itemType_url6",
      "itemType_url7",
      "itemType_url8",
      "itemType_vendor_Name",
   ],
   "exportFilters": [],
   "frequency": "ONETIME"
}

export const RETURN_INVOICE_API_BODY = {
   "exportJobTypeName": "Return Invoices",
   "exportColums": [
      "displayorderCode",
      "invoiceCode",
      "returnInvoiceCode",
      "ShippingPackageCode",
      "shippingPackageStatusCode",
      "returnedDate",
      "customerName",
      "skuCode",
      "itemTypeName",
      "qty",
      "transferPrice",
      "cgst",
      "igst",
      "sgst",
      "utgst",
      "cess",
      "cgstrate",
      "igstrate",
      "sgstrate",
      "utgstrate",
      "cessrate"
   ],
   "exportFilters": [
      {
         "id": "addedOn",
         "dateRange": {
            "start": 1774981800000,
            "end": 1775845799999
         }
      }
   ],
   "frequency": "ONETIME"
}
