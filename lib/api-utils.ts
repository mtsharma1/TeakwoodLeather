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