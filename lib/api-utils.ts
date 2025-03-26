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