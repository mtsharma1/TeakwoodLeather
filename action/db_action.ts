'use server'

import prisma from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { roundToDecimals, safeNumber } from "@/lib/utils"
import { MonthDataItem, PriceCheckInvoiceData, ProductData, ReturnCourierData, ReturnReverseData, TranzactPurchaseOrderReport } from "@/types/order"
import { isValid, parse, parseISO } from "date-fns"

// export async function saveMonthlyDataWithChunking(transformedData: MonthDataItem[], chunkSize = 1000) {
//    try {
//       for (let i = 0; i < transformedData.length; i += chunkSize) {
//          const chunk = transformedData.slice(i, i + chunkSize)

//          await prisma.monthDataItem.createMany({
//             data: chunk,
//             skipDuplicates: true
//          })

//          console.log(`Processed chunk ${Math.floor(i / chunkSize) + 1}`)
//       }

//       console.log(`Total records processed: ${transformedData.length}`)
//    } catch (error) {
//       console.error("Chunked insert error:", error)
//       throw error
//    }
// }

export async function saveProductsOptimally(rawData: ProductData[]) {
   try {
      const data = rawData.map(x => ({
         product_code: x['Product Code']?.toString() || "",
         name: x['Name'],
         color: x['Color'],
         size: x['Size'],
         brand: x['Brand'],
         tags: x['Tags'] || "",
         image_urls: JSON.stringify([
            x['Image Url'],
            x['Image Url 1'],
            x['Image Url 2'],
            x['Image Url 3'],
            x['Image Url 4'],
            x['Image Url 5'],
            x['Image Url 6'],
            x['URL 7'],
            x['URL 8'],
         ].filter(url => url && url !== "-")), // Convert to JSON string
         product_page_url: x['Product Page Url'] || "",
         category_name: x['Category Name'],
         type: x['Type'],
         sku_type: x['Sku Type'],
         month_grade: x['Month Grade'] || "",
         parent_sku: x['Parent SKU'],
         product_title: x['Product Title'] || "",
         vendor_name: x['Vendor Name'],
      }));
      
      await prisma.productWithImage.deleteMany();

      const result = await prisma.productWithImage.createMany({
         data,
         skipDuplicates: true, // Avoid duplicate records
      });

      return result;
   } catch (error) {
      console.error("Bulk insert error:", error);
      throw error;
   }
}

export async function saveMonthlyDataOptimally(transformedData: MonthDataItem[]) {
   try {
      const data = transformedData.map(x => ({
         skuCode: x['Sku Code']?.toString() || "",
         parentSKU: x['Parent SKU'],
         size: x['Size'],
         categoryName: x['Category Name'],
         subCategory: x['Sub Category'],
         saleQty: x['Sale Qty']?.toString() || "",
         saleAmount: roundToDecimals(safeNumber(x['Sale Amount']))?.toString() || "",
         vendorName: x['Vendor Name'],
         staticGrade: x['Static Grade'],
         monthGrade: x['Month Grade'],
         availableInventory: x['Available Inventory'],
         openPurchase: x['Open Purchase'],
         requiredQty: x['Required Qty'],
         orderQty: x['Order Qty'],
         saleThrough: x['Sale Through'],
         vendorPrice: x['Vendor Price'],
         totalAmount: roundToDecimals(safeNumber(x['Total Amount']))?.toString() || "",
         skuCodeID: x['Sku Code ID '],
         daysOfPositiveInventory: x['Days of positive inventory'],
         ros: roundToDecimals(safeNumber(x['ROS']))?.toString() || "",
         doh: roundToDecimals(safeNumber(x['DOH']))?.toString() || "",
         newSkuCode: x['New SKU Code'],
         staticGradeN: x['Static Grade_N']?.toString() || "",
         monthGradeN: x['Month Grade_N']?.toString() || "",
         comment: x['Comment'],
         avgSellingPrice: roundToDecimals(safeNumber(x['Avg Selling Price']))?.toString() || "",
         multiplePrice: roundToDecimals(safeNumber(x['Multiple Price']))?.toString() || "",
      }))

      if (data.length === 0) {
         return { count: 0 }
      }

      const [, result] = await prisma.$transaction([
         prisma.monthDataItem.deleteMany(),
         prisma.monthDataItem.createMany({
            data,
         }),
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

      return result
   } catch (error) {
      console.error("Bulk insert error:", error)
      throw error
   }
}

export async function savePriceCheckData(dataArray: PriceCheckInvoiceData[]) {
   // function parseCustomDate(dateString: string): Date | string {
   //    if (!dateString || dateString === 'N/A') return "";

   //    try {
   //       const parsedDate = parseISO(dateString);
   //       return isValid(parsedDate) ? parsedDate : "";
   //    } catch (error) {
   //       console.warn(`Error parsing date: ${dateString}`, error);
   //       return "";
   //    }
   // }

   function parseCustomDate(dateString: string): Date {
      if (!dateString || dateString === 'N/A') {
         return new Date();
      }

      // Try multiple parsing strategies
      const parseStrategies = [
         () => parseISO(dateString),
         () => parse(dateString, 'dd/MM/yyyy', new Date()),
         () => parse(dateString, 'MM/dd/yyyy', new Date()),
         () => parse(dateString, 'yyyy-MM-dd', new Date())
      ];

      for (const strategy of parseStrategies) {
         const parsedDate = strategy();
         if (isValid(parsedDate)) {
            return parsedDate;
         }
      }

      console.warn(`Could not parse date: ${dateString}`);
      return new Date();
   }


   const formattedData = dataArray.map((x) => ({
      orderNo: x["Order No"],
      invoiceNo: x["Invoice No"],
      shippingPackageCode: x["Shipping Package Code"],
      shippingPackageStatusCode: x["Shipping Package Status Code"],
      invoiceCreatedDate: x["Invoice Created Date"],
      channelInvoiceCreatedDate: parseCustomDate(x["Channel Invoice Created Date"]),
      eWayBillNo: x["EWayBill No"] !== "N/A" ? x["EWayBill No"] : null,
      eWayBillDate: parseCustomDate(x["EWayBill Date"]),
      eWayBillValidTill: parseCustomDate(x["EWayBill Valid Till"]),

      customerName: x["Customer Name"],
      skuCode: x["SKU Code"],
      skuName: x["SKU Name"],
      quantity: safeNumber(x["Quantity"]),
      invoiceTax: safeNumber(x["Invoice Tax"]),
      invoiceTotal: safeNumber(x["Invoice Total"]),
      invoiceCancelled: x["Invoice Cancelled"],
      hsnCode: safeNumber(x["HSN Code"]),
      gstTaxTypeCode: safeNumber(x["GST Tax Type Code"]),
      taxTypeCode: safeNumber(x["Tax Type Code"]),
      cgst: safeNumber(x["CGST"]),
      igst: safeNumber(x["IGST"]),
      sgst: safeNumber(x["SGST"]),
      utgst: safeNumber(x["UTGST"]),
      vat: safeNumber(x["VAT"]),
      cst: safeNumber(x["CST"]),
      additionalTax: safeNumber(x["Additional Tax"]),
      additionalTaxPercentage: safeNumber(x["Additional Tax Percentage"]),
      taxPercentage: safeNumber(x["Tax Percentage"]),
      cess: safeNumber(x["CESS"]),
      cgstRate: safeNumber(x["CGST Rate"]),
      igstRate: safeNumber(x["IGST Rate"]),
      sgstRate: safeNumber(x["SGST Rate"]),
      utgstRate: safeNumber(x["UTGST Rate"]),
      cessRate: safeNumber(x["CESS Rate"]),
      shippingCharge: safeNumber(x["Shipping Charge"]),
      codCharge: safeNumber(x["COD Charge"]),
      tcsAmount: safeNumber(x["TCS Amount"]),
      channelName: x["Channel Name"],
      uniwareInvoiceCode: x["Uniware Invoice Code"],
      adjustmentInSellingPrice: safeNumber(x["Adjustment In Selling Price"]),
      adjustmentInDiscount: safeNumber(x["Adjustment In Discount"]),
      grade: x["Grade"],
      mrp: safeNumber(x["MRP"]),
      color: x["Color"],
      brand: x["Brand"],
      size: x["Size"],
      sellerSkuCode: x["Seller Sku Code"],
      costPrice: safeNumber(x["Cost Price"]),
      concateArticle: x["Concate Article"],
      totalCost: roundToDecimals(safeNumber(x["Total Cost"])).toString() || "",
      totalSellingPrice: roundToDecimals(safeNumber(x["Total Selling Price"])).toString() || "",
      status: x["Status"],
      sellingPriceLt300: x["Selling Price < 300"],
      invoiceCount: x["Invoice Count"],
      discountPercentage: x["Discount %"],
      multiplePrice: roundToDecimals(safeNumber(x['Multiple Price']))?.toString() || "",
   }));

   await prisma.priceCheckData.createMany({ data: formattedData });
}

export async function convertPriceCheckData() {
   const priceCheckData = await prisma.priceCheckData.findMany({
      orderBy: [
         {
            multiplePrice: 'desc',
         },
      ],
      // take: 600,
   });
   return priceCheckData.map((x) => ({
      "id": x.id,
      "Invoice Created Date": x.invoiceCreatedDate.toString(),
      "SKU Code": x.skuCode,
      "Total Selling Price": x.totalSellingPrice,
      "Multiple Price": x.multiplePrice,
      "Cost Price": x.costPrice,
      "Channel Name": x.channelName,
      "Order No": x.orderNo,
      "Invoice No": x.invoiceNo,
      "Shipping Package Code": x.shippingPackageCode,
      "Shipping Package Status Code": x.shippingPackageStatusCode,
      "Channel Invoice Created Date": x.channelInvoiceCreatedDate.toString(),
      "EWayBill No": x.eWayBillNo || "N/A",
      "EWayBill Date": x.eWayBillDate?.toString() || "N/A",
      "EWayBill Valid Till": x.eWayBillValidTill?.toString() || "N/A",
      "Customer Name": x.customerName,
      "SKU Name": x.skuName,
      "Quantity": x.quantity,
      "Invoice Tax": safeNumber(x.invoiceTax),
      "Invoice Total": safeNumber(x.invoiceTotal),
      "Invoice Cancelled": x.invoiceCancelled,
      "HSN Code": x.hsnCode,
      "GST Tax Type Code": x.gstTaxTypeCode,
      "Tax Type Code": x.taxTypeCode,
      "CGST": x.cgst,
      "IGST": x.igst,
      "SGST": x.sgst,
      "UTGST": x.utgst,
      "VAT": x.vat,
      "CST": x.cst,
      "Additional Tax": x.additionalTax,
      "Additional Tax Percentage": x.additionalTaxPercentage,
      "Tax Percentage": x.taxPercentage,
      "CESS": x.cess,
      "CGST Rate": x.cgstRate,
      "IGST Rate": x.igstRate,
      "SGST Rate": x.sgstRate,
      "UTGST Rate": x.utgstRate,
      "CESS Rate": x.cessRate,
      "Shipping Charge": x.shippingCharge,
      "COD Charge": x.codCharge,
      "TCS Amount": x.tcsAmount,
      "Uniware Invoice Code": x.uniwareInvoiceCode,
      "Adjustment In Selling Price": x.adjustmentInSellingPrice,
      "Adjustment In Discount": x.adjustmentInDiscount,
      "Grade": x.grade,
      "MRP": x.mrp,
      "Color": x.color,
      "Brand": x.brand,
      "Size": x.size,
      "Seller Sku Code": x.sellerSkuCode,
      "Business Type": "", // will update soon
      "Concate Article": x.concateArticle,
      "Total Cost": x.totalCost,
      "Status": x.status,
      "Selling Price < 300": x.sellingPriceLt300,
      "Invoice Count": x.invoiceCount,
      "Discount %": x.discountPercentage,
      "Remarks": `${x?.remarks ?? ""}`,
   })) || [];
}

function getReturnInvoiceField(
   item: Record<string, string | number>,
   possibleKeys: string[],
) {
   const entries = Object.entries(item)
   const normalizedKeys = possibleKeys.map((key) => key.replaceAll(" ", "").toLowerCase())

   for (const [rawKey, rawValue] of entries) {
      const normalizedRawKey = rawKey.replaceAll(" ", "").toLowerCase()

      if (normalizedKeys.includes(normalizedRawKey) && rawValue !== undefined && rawValue !== null) {
         return rawValue
      }
   }

   return ""
}

export async function saveReturnInvoiceData(dataArray: Record<string, string | number>[]) {
   const formattedData = mapReturnInvoiceRowsForStorage(dataArray)
   const prismaAny = prisma as unknown as Record<string, unknown>
   const delegate = prismaAny.returnInvoiceData as
      | { deleteMany: () => Promise<unknown>; createMany: (args: { data: ReturnType<typeof mapReturnInvoiceRowsForStorage> }) => Promise<unknown> }
      | undefined

   if (!delegate?.deleteMany || !delegate?.createMany) {
      // ReturnInvoiceData model is removed from schema in this deployment.
      return
   }

   await delegate.deleteMany()
   await delegate.createMany({ data: formattedData })
}

export async function convertReturnInvoiceData(): Promise<Record<string, string | number>[]> {
   const prismaAny = prisma as unknown as Record<string, unknown>
   const delegate = prismaAny.returnInvoiceData as
      | { findMany: (args: { orderBy: { returnedDate: "desc" }[] }) => Promise<Array<Parameters<typeof mapReturnInvoiceRowForOutput>[0]>> }
      | undefined

   if (!delegate?.findMany) {
      return []
   }

   const returnInvoiceData = await delegate.findMany({
      orderBy: [
         {
            returnedDate: "desc",
         },
      ],
   })

   return returnInvoiceData.map(mapReturnInvoiceRowForOutput)
}

export async function saveReturnCourierData(dataArray: Record<string, string | number>[]) {
   const formattedData = mapReturnCourierRowsForStorage(dataArray)
   const prismaAny = prisma as unknown as Record<string, unknown>
   const delegate = prismaAny.returnCourierData as
      | { deleteMany: () => Promise<unknown>; createMany: (args: { data: ReturnType<typeof mapReturnCourierRowsForStorage> }) => Promise<unknown> }
      | undefined

   if (delegate?.deleteMany && delegate?.createMany) {
      try {
         await delegate.deleteMany()
         await delegate.createMany({ data: formattedData })
         return
      } catch {
         // Fall back to raw SQL path when Prisma client is out of sync with schema.
      }
   }

   await saveReturnDataWithRawSql("ReturnCourierData", formattedData)
}

export async function convertReturnCourierData(): Promise<ReturnCourierData[]> {
   const prismaAny = prisma as unknown as Record<string, unknown>
   const delegate = prismaAny.returnCourierData as
      | { findMany: (args: { orderBy: { created: "desc" }[] }) => Promise<Array<Parameters<typeof mapReturnCourierRowForOutput>[0]>> }
      | undefined

   let returnCourierData: Array<Parameters<typeof mapReturnCourierRowForOutput>[0]> = []
   if (delegate?.findMany) {
      try {
         returnCourierData = await delegate.findMany({
            orderBy: [
               {
                  created: "desc",
               },
            ],
         })
      } catch {
         returnCourierData = await fetchReturnDataWithRawSql("ReturnCourierData")
      }
   } else {
      returnCourierData = await fetchReturnDataWithRawSql("ReturnCourierData")
   }

   return returnCourierData.map(mapReturnCourierRowForOutput)
}

export async function saveReturnReverseData(dataArray: Record<string, string | number>[]) {
   const formattedData = mapReturnReverseRowsForStorage(dataArray)

   // A remote MySQL connection makes one INSERT per row extremely slow.  Keep
   // the replacement atomic, but send the rows in reasonably sized bulk
   // inserts so this also stays below MySQL's statement/packet limits.
   const batchSize = 1000
   const batches = Array.from(
      { length: Math.ceil(formattedData.length / batchSize) },
      (_, index) => formattedData.slice(index * batchSize, (index + 1) * batchSize),
   )

   await prisma.$transaction([
      prisma.returnReverseData.deleteMany(),
      ...batches.map((data) => prisma.returnReverseData.createMany({ data })),
   ])
}

export async function convertReturnReverseData(): Promise<ReturnReverseData[]> {
   const returnReverseData = await fetchReturnReverseDataWithRawSql()

   return returnReverseData.map(mapReturnReverseRowForOutput)
}

type ReturnCourierStorageRow = ReturnType<typeof mapReturnCourierRowsForStorage>[number]

async function saveReturnDataWithRawSql(
   tableName: "ReturnCourierData",
   rows: ReturnCourierStorageRow[],
) {
   await prisma.$executeRawUnsafe(`DELETE FROM \`${tableName}\``)

   if (rows.length === 0) {
      return
   }

   for (const row of rows) {
      await prisma.$executeRawUnsafe(
         `INSERT INTO \`${tableName}\` (
            \`Sale Order No\`,
            \`Shipping Package Code\`,
            \`Shipping Package Status\`,
            \`Shipping Provider\`,
            \`Shipping Courier\`,
            \`AWB No\`,
            \`Return Delivery Date\`,
            \`RTO Reason\`,
            \`Created\`,
            \`Channel Created\`,
            \`Return Manifest Code\`,
            \`Return Manifest Added\`,
            \`Return Manifest Status\`,
            \`Return Manifest Created By\`,
            \`Return Manifest Created At\`,
            \`Reshipment Action\`,
            \`Channel\`,
            \`Putaway No\`,
            \`Putaway Status\`,
            \`Putaway By\`,
            \`Putaway Date\`,
            \`Dispatch Facility\`,
            \`Return Facility\`,
            \`createdAt\`,
            \`updatedAt\`
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
         row.saleOrderNo,
         row.shippingPackageCode,
         row.shippingPackageStatus,
         row.shippingProvider,
         row.shippingCourier,
         row.awbNo,
         row.returnDeliveryDate,
         row.rtoReason,
         row.created,
         row.channelCreated,
         row.returnManifestCode,
         row.returnManifestAdded,
         row.returnManifestStatus,
         row.returnManifestCreatedBy,
         row.returnManifestCreatedAt,
         row.reshipmentAction,
         row.channel,
         row.putawayNo,
         row.putawayStatus,
         row.putawayBy,
         row.putawayDate,
         row.dispatchFacility,
         row.returnFacility,
      )
   }
}

async function fetchReturnDataWithRawSql(
   tableName: "ReturnCourierData",
): Promise<Array<Parameters<typeof mapReturnCourierRowForOutput>[0]>> {
   const rows = await prisma.$queryRawUnsafe<Array<Parameters<typeof mapReturnCourierRowForOutput>[0]>>(
      `SELECT
         \`Sale Order No\` AS saleOrderNo,
         \`Shipping Package Code\` AS shippingPackageCode,
         \`Shipping Package Status\` AS shippingPackageStatus,
         \`Shipping Provider\` AS shippingProvider,
         \`Shipping Courier\` AS shippingCourier,
         \`AWB No\` AS awbNo,
         \`Return Delivery Date\` AS returnDeliveryDate,
         \`RTO Reason\` AS rtoReason,
         \`Created\` AS created,
         \`Channel Created\` AS channelCreated,
         \`Return Manifest Code\` AS returnManifestCode,
         \`Return Manifest Added\` AS returnManifestAdded,
         \`Return Manifest Status\` AS returnManifestStatus,
         \`Return Manifest Created By\` AS returnManifestCreatedBy,
         \`Return Manifest Created At\` AS returnManifestCreatedAt,
         \`Reshipment Action\` AS reshipmentAction,
         \`Channel\` AS channel,
         \`Putaway No\` AS putawayNo,
         \`Putaway Status\` AS putawayStatus,
         \`Putaway By\` AS putawayBy,
         \`Putaway Date\` AS putawayDate,
         \`Dispatch Facility\` AS dispatchFacility,
         \`Return Facility\` AS returnFacility
      FROM \`${tableName}\`
      ORDER BY \`Created\` DESC`
   )

   return rows ?? []
}

async function fetchReturnReverseDataWithRawSql(): Promise<Array<Parameters<typeof mapReturnReverseRowForOutput>[0]>> {
   const rows = await prisma.$queryRawUnsafe<Array<Parameters<typeof mapReturnReverseRowForOutput>[0]>>(
      `SELECT
         \`Sale Order Item Code\` AS saleOrderItemCode,
         \`Sale Order Created\` AS saleOrderCreated,
         \`Sale Order Code\` AS saleOrderCode,
         \`Item Type Name\` AS itemTypeName,
         \`Item Type SKU\` AS itemTypeSku,
         \`Reverse Pickup Code\` AS reversePickupCode,
         \`Tracking Number\` AS trackingNumber,
         \`Dispatched Date\` AS dispatchedDate,
         \`Reference Code\` AS referenceCode,
         \`Import Reference Id\` AS importReferenceId,
         \`Reverse Pickup Created\` AS reversePickupCreated,
         \`Reverse Pickup Updated\` AS reversePickupUpdated,
         \`Reverse Pickup Status\` AS reversePickupStatus,
         \`Reverse Pickup Action\` AS reversePickupAction,
         \`Return Reason\` AS returnReason,
         \`Customer Image Url\` AS customerImageUrl,
         \`Replacement Sale Order Code\` AS replacementSaleOrderCode,
         \`Channel\` AS channel,
         \`Total Received Items\` AS totalReceivedItems,
         \`QC Comments\` AS qcComments,
         \`Reverse Pickup Created By\` AS reversePickupCreatedBy,
         \`Putaway Code\` AS putawayCode,
         \`Created By\` AS createdBy,
         \`Putaway Status\` AS putawayStatus,
         \`Putaway Last Updated\` AS putawayLastUpdated,
         \`Courier Provider Name\` AS courierProviderName,
         \`Return Item Status\` AS returnItemStatus,
         \`Shipping Courier Status\` AS shippingCourierStatus,
         \`Shipping Tracking Status\` AS shippingTrackingStatus,
         \`Item Seal Id\` AS itemSealId,
         \`Return Delivery Date\` AS returnDeliveryDate,
         \`Channel Return Created Date\` AS channelReturnCreatedDate,
         \`Return Courier Name\` AS returnCourierName,
         \`Return Remarks\` AS returnRemarks
      FROM \`ReturnReverseData\`
      ORDER BY \`Reverse Pickup Created\` DESC`
   )

   return rows ?? []
}

function mapReturnInvoiceRowsForStorage(dataArray: Record<string, string | number>[]) {
   return dataArray.map((item) => ({
      displayOrderCode: String(getReturnInvoiceField(item, ["Display Order Code", "displayorderCode", "DisplayorderCode"])),
      invoiceCode: String(getReturnInvoiceField(item, ["Invoice Code", "invoiceCode"])),
      returnInvoiceCode: String(getReturnInvoiceField(item, ["Return Invoice Code", "returnInvoiceCode"])),
      shippingPackageCode: String(getReturnInvoiceField(item, ["Shipping Package Code", "ShippingPackageCode", "shippingPackageCode"])),
      shippingPackageStatusCode: String(getReturnInvoiceField(item, ["Shipping Package Status Code", "shippingPackageStatusCode"])),
      putawayStatus: String(getReturnInvoiceField(item, ["Putaway Status", "putawayStatus"])),
      returnedDate: String(getReturnInvoiceField(item, ["Returned Date", "returnedDate"])),
      customerName: String(getReturnInvoiceField(item, ["Customer Name", "customerName"])),
      skuCode: String(getReturnInvoiceField(item, ["SKU Code", "Sku Code", "skuCode", "skucode"])),
      itemTypeName: String(getReturnInvoiceField(item, ["Item Type Name", "itemTypeName"])),
      qty: safeNumber(getReturnInvoiceField(item, ["Qty", "qty"])),
      transferPrice: safeNumber(getReturnInvoiceField(item, ["Transfer Price", "transferPrice"])),
      cgst: safeNumber(getReturnInvoiceField(item, ["CGST", "cgst"])),
      igst: safeNumber(getReturnInvoiceField(item, ["IGST", "igst"])),
      sgst: safeNumber(getReturnInvoiceField(item, ["SGST", "sgst"])),
      utgst: safeNumber(getReturnInvoiceField(item, ["UTGST", "utgst"])),
      cess: safeNumber(getReturnInvoiceField(item, ["CESS", "cess"])),
      cgstRate: safeNumber(getReturnInvoiceField(item, ["CGST Rate", "cgstrate"])),
      igstRate: safeNumber(getReturnInvoiceField(item, ["IGST Rate", "igstrate"])),
      sgstRate: safeNumber(getReturnInvoiceField(item, ["SGST Rate", "sgstrate"])),
      utgstRate: safeNumber(getReturnInvoiceField(item, ["UTGST Rate", "utgstrate"])),
      cessRate: safeNumber(getReturnInvoiceField(item, ["CESS Rate", "cessrate"])),
   }))
}

function mapReturnCourierRowsForStorage(dataArray: Record<string, string | number>[]) {
   return dataArray.map((item) => ({
      saleOrderNo: String(getReturnInvoiceField(item, ["Sale Order No", "saleOrderNo"])),
      shippingPackageCode: String(getReturnInvoiceField(item, ["Shipping Package Code", "shippingPackageCode"])),
      shippingPackageStatus: String(getReturnInvoiceField(item, ["Shipping Package Status", "shippingPackageStatus"])),
      shippingProvider: String(getReturnInvoiceField(item, ["Shipping Provider", "shippingProvider"])),
      shippingCourier: String(getReturnInvoiceField(item, ["Shipping Courier", "shippingCourier"])),
      awbNo: String(getReturnInvoiceField(item, ["AWB No", "awbNo"])),
      returnDeliveryDate: String(getReturnInvoiceField(item, ["Return Delivery Date", "returnDeliveryDate"])),
      rtoReason: String(getReturnInvoiceField(item, ["RTO Reason", "rtoReason"])),
      created: String(getReturnInvoiceField(item, ["Created", "created"])),
      channelCreated: String(getReturnInvoiceField(item, ["Channel Created", "channelCreated"])),
      returnManifestCode: String(getReturnInvoiceField(item, ["Return Manifest Code", "returnManifestCode"])),
      returnManifestAdded: String(getReturnInvoiceField(item, ["Return Manifest Added", "returnManifestAdded"])),
      returnManifestStatus: String(getReturnInvoiceField(item, ["Return Manifest Status", "returnManifestStatus"])),
      returnManifestCreatedBy: String(getReturnInvoiceField(item, ["Return Manifest Created By", "returnManifestCreatedBy"])),
      returnManifestCreatedAt: String(getReturnInvoiceField(item, ["Return Manifest Created At", "returnManifestCreatedAt"])),
      reshipmentAction: String(getReturnInvoiceField(item, ["Reshipment Action", "reshipmentAction"])),
      channel: String(getReturnInvoiceField(item, ["Channel", "channel"])),
      putawayNo: String(getReturnInvoiceField(item, ["Putaway No", "putawayNo"])),
      putawayStatus: String(getReturnInvoiceField(item, ["Putaway Status", "putawayStatus"])),
      putawayBy: String(getReturnInvoiceField(item, ["Putaway By", "putawayBy"])),
      putawayDate: String(getReturnInvoiceField(item, ["Putaway Date", "putawayDate"])),
      dispatchFacility: String(getReturnInvoiceField(item, ["Dispatch Facility", "dispatchFacility"])),
      returnFacility: String(getReturnInvoiceField(item, ["Return Facility", "returnFacility"])),
   }))
}

function mapReturnReverseRowsForStorage(dataArray: Record<string, string | number>[]) {
   return dataArray.map((item) => ({
      saleOrderItemCode: String(getReturnInvoiceField(item, ["Sale Order Item Code", "saleOrderItemCode"])),
      saleOrderCreated: String(getReturnInvoiceField(item, ["Sale Order Created", "saleOrderCreated"])),
      saleOrderCode: String(getReturnInvoiceField(item, ["Sale Order Code", "saleOrderCode"])),
      itemTypeName: String(getReturnInvoiceField(item, ["Item Type Name", "itemtypeName"])),
      itemTypeSku: String(getReturnInvoiceField(item, ["Item Type SKU", "itemtypeSku"])),
      reversePickupCode: String(getReturnInvoiceField(item, ["Reverse Pickup Code", "reversePickupCode"])),
      trackingNumber: String(getReturnInvoiceField(item, ["Tracking Number", "trackingNumber"])),
      dispatchedDate: String(getReturnInvoiceField(item, ["Dispatched Date", "dispatchedDate"])),
      referenceCode: String(getReturnInvoiceField(item, ["Reference Code", "referenceCode"])),
      importReferenceId: String(getReturnInvoiceField(item, ["Import Reference Id", "importReferenceId"])),
      reversePickupCreated: String(getReturnInvoiceField(item, ["Reverse Pickup Created", "reversePickupCreated"])),
      reversePickupUpdated: String(getReturnInvoiceField(item, ["Reverse Pickup Updated", "reversePickupUpdated"])),
      reversePickupStatus: String(getReturnInvoiceField(item, ["Reverse Pickup Status", "reversePickupStatus"])),
      reversePickupAction: String(getReturnInvoiceField(item, ["Reverse Pickup Action", "reversePickupAction"])),
      returnReason: String(getReturnInvoiceField(item, ["Return Reason", "returnReason"])),
      customerImageUrl: String(getReturnInvoiceField(item, ["Customer Image Url", "customerImageUrl"])),
      replacementSaleOrderCode: String(getReturnInvoiceField(item, ["Replacement Sale Order Code", "replacementSaleOrderCode"])),
      channel: String(getReturnInvoiceField(item, ["Channel", "channel"])),
      totalReceivedItems: safeNumber(getReturnInvoiceField(item, ["Total Received Items", "totalReceivedItems"])),
      qcComments: String(getReturnInvoiceField(item, ["QC Comments", "qcComments"])),
      reversePickupCreatedBy: String(getReturnInvoiceField(item, ["Reverse Pickup Created By", "reversePickupCreatedBy"])),
      putawayCode: String(getReturnInvoiceField(item, ["Putaway Code", "putawayCode"])),
      createdBy: String(getReturnInvoiceField(item, ["Created By", "createdBy"])),
      putawayStatus: String(getReturnInvoiceField(item, ["Putaway Status", "putawayStatus"])),
      putawayLastUpdated: String(getReturnInvoiceField(item, ["Putaway Last Updated", "putawayLastUpdated"])),
      courierProviderName: String(getReturnInvoiceField(item, ["Courier Provider Name", "courierProvideName"])),
      returnItemStatus: String(getReturnInvoiceField(item, ["Return Item Status", "returnItemStatus"])),
      shippingCourierStatus: String(getReturnInvoiceField(item, ["Shipping Courier Status", "shippingCourierStatus"])),
      shippingTrackingStatus: String(getReturnInvoiceField(item, ["Shipping Tracking Status", "shippingTrackingStatus"])),
      itemSealId: String(getReturnInvoiceField(item, ["Item Seal Id", "itemSealId"])),
      returnDeliveryDate: String(getReturnInvoiceField(item, ["Return Delivery Date", "returnDeliveryDate"])),
      channelReturnCreatedDate: String(getReturnInvoiceField(item, ["Channel Return Created Date", "channelReturnCreatedDate"])),
      returnCourierName: String(getReturnInvoiceField(item, ["Return Courier Name", "returnCourierName"])),
      returnRemarks: String(getReturnInvoiceField(item, ["Return Remarks", "returnRemarks"])),
   }))
}

function mapReturnInvoiceRowForOutput(x: {
   displayOrderCode: string
   invoiceCode: string
   returnInvoiceCode: string
   shippingPackageCode: string
   shippingPackageStatusCode: string
   putawayStatus?: string | null
   returnedDate: string
   customerName: string
   skuCode: string
   itemTypeName: string
   qty: number
   transferPrice: number
   cgst: number
   igst: number
   sgst: number
   utgst: number
   cess: number
   cgstRate: number
   igstRate: number
   sgstRate: number
   utgstRate: number
   cessRate: number
}) {
   return {
      "Display Order Code": x.displayOrderCode,
      "Invoice Code": x.invoiceCode,
      "Return Invoice Code": x.returnInvoiceCode,
      "Shipping Package Code": x.shippingPackageCode,
      "Shipping Package Status Code": x.shippingPackageStatusCode,
      "Putaway Status": x.putawayStatus || "",
      "Returned Date": x.returnedDate,
      "Customer Name": x.customerName,
      "skuCode": x.skuCode,
      "Item Type Name": x.itemTypeName,
      "Qty": x.qty,
      "Transfer Price": x.transferPrice,
      "CGST": x.cgst,
      "IGST": x.igst,
      "SGST": x.sgst,
      "UTGST": x.utgst,
      "CESS": x.cess,
      "CGST Rate": x.cgstRate,
      "IGST Rate": x.igstRate,
      "SGST Rate": x.sgstRate,
      "UTGST Rate": x.utgstRate,
      "CESS Rate": x.cessRate,
   }
}

function mapReturnCourierRowForOutput(x: {
   saleOrderNo: string
   shippingPackageCode: string
   shippingPackageStatus: string
   shippingProvider: string
   shippingCourier: string
   awbNo: string
   returnDeliveryDate: string
   rtoReason: string
   created: string
   channelCreated: string
   returnManifestCode: string
   returnManifestAdded: string
   returnManifestStatus: string
   returnManifestCreatedBy: string
   returnManifestCreatedAt: string
   reshipmentAction: string
   channel: string
   putawayNo: string
   putawayStatus?: string | null
   putawayBy: string
   putawayDate: string
   dispatchFacility: string
   returnFacility: string
}) {
   return {
      "Sale Order No": x.saleOrderNo,
      "Shipping Package Code": x.shippingPackageCode,
      "Shipping Package Status": x.shippingPackageStatus,
      "Shipping Provider": x.shippingProvider,
      "Shipping Courier": x.shippingCourier,
      "AWB No": x.awbNo,
      "Return Delivery Date": x.returnDeliveryDate,
      "RTO Reason": x.rtoReason,
      "Created": x.created,
      "Channel Created": x.channelCreated,
      "Return Manifest Code": x.returnManifestCode,
      "Return Manifest Added": x.returnManifestAdded,
      "Return Manifest Status": x.returnManifestStatus,
      "Return Manifest Created By": x.returnManifestCreatedBy,
      "Return Manifest Created At": x.returnManifestCreatedAt,
      "Reshipment Action": x.reshipmentAction,
      "Channel": x.channel,
      "Putaway No": x.putawayNo,
      "Putaway Status": x.putawayStatus || "",
      "Putaway By": x.putawayBy,
      "Putaway Date": x.putawayDate,
      "Dispatch Facility": x.dispatchFacility,
      "Return Facility": x.returnFacility,
   }
}

function mapReturnReverseRowForOutput(x: {
   saleOrderItemCode: string
   saleOrderCreated: string
   saleOrderCode: string
   itemTypeName: string
   itemTypeSku: string
   reversePickupCode: string
   trackingNumber: string
   dispatchedDate: string
   referenceCode: string
   importReferenceId: string
   reversePickupCreated: string
   reversePickupUpdated: string
   reversePickupStatus: string
   reversePickupAction: string
   returnReason: string
   customerImageUrl: string
   replacementSaleOrderCode: string
   channel: string
   totalReceivedItems: number
   qcComments: string
   reversePickupCreatedBy: string
   putawayCode: string
   createdBy: string
   putawayStatus?: string | null
   putawayLastUpdated: string
   courierProviderName: string
   returnItemStatus: string
   shippingCourierStatus: string
   shippingTrackingStatus: string
   itemSealId: string
   returnDeliveryDate: string
   channelReturnCreatedDate: string
   returnCourierName: string
   returnRemarks: string
}) {
   return {
      "Sale Order Item Code": x.saleOrderItemCode,
      "Sale Order Created": x.saleOrderCreated,
      "Sale Order Code": x.saleOrderCode,
      "Item Type Name": x.itemTypeName,
      "Item Type SKU": x.itemTypeSku,
      "Reverse Pickup Code": x.reversePickupCode,
      "Tracking Number": x.trackingNumber,
      "Dispatched Date": x.dispatchedDate,
      "Reference Code": x.referenceCode,
      "Import Reference Id": x.importReferenceId,
      "Reverse Pickup Created": x.reversePickupCreated,
      "Reverse Pickup Updated": x.reversePickupUpdated,
      "Reverse Pickup Status": x.reversePickupStatus,
      "Reverse Pickup Action": x.reversePickupAction,
      "Return Reason": x.returnReason,
      "Customer Image Url": x.customerImageUrl,
      "Replacement Sale Order Code": x.replacementSaleOrderCode,
      "Channel": x.channel,
      "Total Received Items": x.totalReceivedItems,
      "QC Comments": x.qcComments,
      "Reverse Pickup Created By": x.reversePickupCreatedBy,
      "Putaway Code": x.putawayCode,
      "Created By": x.createdBy,
      "Putaway Status": x.putawayStatus || "",
      "Putaway Last Updated": x.putawayLastUpdated,
      "Courier Provider Name": x.courierProviderName,
      "Return Item Status": x.returnItemStatus,
      "Shipping Courier Status": x.shippingCourierStatus,
      "Shipping Tracking Status": x.shippingTrackingStatus,
      "Item Seal Id": x.itemSealId,
      "Return Delivery Date": x.returnDeliveryDate,
      "Channel Return Created Date": x.channelReturnCreatedDate,
      "Return Courier Name": x.returnCourierName,
      "Return Remarks": x.returnRemarks,
   }
}


function getTranzactField(item: TranzactPurchaseOrderReport, possibleKeys: string[]) {
   const entries = Object.entries(item)
   const normalizedKeys = possibleKeys.map((key) => key.replace(/[^a-z0-9]/gi, "").toLowerCase())

   for (const [rawKey, rawValue] of entries) {
      const normalizedRawKey = rawKey.replace(/[^a-z0-9]/gi, "").toLowerCase()

      if (normalizedKeys.includes(normalizedRawKey) && rawValue !== undefined && rawValue !== null) {
         return rawValue
      }
   }

   return null
}

function getTranzactString(item: TranzactPurchaseOrderReport, possibleKeys: string[]) {
   const value = getTranzactField(item, possibleKeys)
   return value === null ? null : String(value)
}

function getTranzactNumber(item: TranzactPurchaseOrderReport, possibleKeys: string[]) {
   const value = getTranzactField(item, possibleKeys)
   if (value === null) return null

   const parsedValue = safeNumber(String(value).replace(/,/g, ""))
   return Number.isFinite(parsedValue) ? parsedValue : null
}

export async function TransactPurchaseOrderRowForOutput(dataArray: TranzactPurchaseOrderReport[]) {
   return dataArray.map((item) => ({
      poNumber: getTranzactString(item, ["document_no_text", "document_no", "po_number", "PO Number"]),
      supplierName: getTranzactString(item, ["supplier_name", "Supplier Name"]),
      // supplierGstin: getTranzactString(item, ["supplier_gstin", "Supplier GSTIN"]),
      // supplierReferenceId: getTranzactString(item, ["supplier_reference_id", "Supplier Reference ID"]),
      documentDate: getTranzactString(item, ["document_date", "Document Date"]),
      // lastModifiedDate: getTranzactString(item, ["creation_date", "Last Modified Date"]),
      // documentStatus: getTranzactString(item, ["document_status", "Document Status"]),
      goodsStatus: getTranzactString(item, ["goods_status", "Goods Status"]),
      // overdueStatus: getTranzactString(item, ["overdue_status", "Overdue Status"]),
      // invoicingStatus: getTranzactString(item, ["invoice_status", "invoicing_status", "Invoicing Status"]),
      // amendmentCounter: getTranzactString(item, ["amendment", "amendment", "Amendment Counter"]),
      foreignDomestic: getTranzactString(item, ["currency_text", "foreign_domestic", "Foreign/Domestic"]),
      itemId: getTranzactString(item, ["item_id", "Item ID"]),
      itemDescription: getTranzactString(item, ["item_name", "Item Description"]),
      itemCategory: getTranzactString(item, ["product_category", "Item Category"]),
      // hsnSac: getTranzactString(item, ["hsn_sac", "HSN/SAC"]),
      goodsService: getTranzactString(item, ["item_type", "Goods/Service"]),
      // itemDeliveryDate: getTranzactString(item, ["doc_delivery_date", "item_delivery_date", "Item Delivery Date"]),
      poQuantity: getTranzactString(item, ["quantity", "no_of_items", "PO Quantity"]),
      uom: getTranzactString(item, ["uom", "UOM"]),
      totalIndentQuantity: getTranzactString(item, ["total_indent_quantity", "Total Indent Quantity"]),
      // indentNumber: getTranzactString(item, ["indent_number", "Indent Number"]),
      // indentDate: getTranzactString(item, ["indent_date", "Indent Date"]),
      // ocNumber: getTranzactString(item, ["oc_number", "OC Number"]),
      // ocDate: getTranzactString(item, ["oc_date", "OC Date"]),
      itemRate: getTranzactString(item, ["item_rate", "Item Price"]),
      // discountPercentage: getTranzactString(item, ["discount_percentage", "Discount Percentage"]),
      // itemRateAfterDiscount: getTranzactString(item, ["item_rate_after_discount", "Item Rate - After Discount"]),
      // itemTotalBeforeDiscount: getTranzactString(item, ["itemTotal", "item_total", "item_total_before_discount", "Item Total - Before Discount"]),
      // itemDiscountAmount: getTranzactString(item, ["item_discount_amount", "Item Discount Amount"]),
      // itemValueBeforeTax: getTranzactString(item, ["item_value_before_tax", "Item Value - Before Tax"]),
      // cgstRate: getTranzactString(item, ["cgst_rate", "CGST Rate"]),
      // cgst: getTranzactString(item, ["cgst", "CGST"]),
      // sgstRate: getTranzactString(item, ["sgst_rate", "SGST Rate"]),
      // sgst: getTranzactString(item, ["sgst", "SGST"]),
      // igstRate: getTranzactString(item, ["igst_rate", "IGST Rate"]),
      // igst: getTranzactString(item, ["igst", "IGST"]),
      // cessRate: getTranzactString(item, ["cess_rate", "Cess Rate"]),
      // cess: getTranzactString(item, ["cess", "Cess"]),
      // itemTax: getTranzactString(item, ["item_tax", "Item Tax"]),
      // itemValueAfterTax: getTranzactString(item, ["item_value_after_tax", "Item Value - After Tax"]),
      // itemComment: getTranzactString(item, ["comment", "item_comment", "Item Comment"]),
      // deliveredQuantity: getTranzactString(item, ["delivered_quantity", "Delivered Quantity"]),
      // deliveredValue: getTranzactString(item, ["delivered_value", "Delivered Value"]),
      balanceQuantity: getTranzactNumber(item, ["balance_quantity", "Balance Quantity"]),
      balanceValue: getTranzactNumber(item, ["balance_value", "Balance Value"]),
      // qirAcceptedQuantity: getTranzactString(item, ["qir_accepted_quantity", "QIR Accepted Quantity"]),
      // acceptedValue: getTranzactString(item, ["accepted_value", "Accepted Value"]),
      // balanceQuantityAsPerAccepted: getTranzactString(item, ["balance_quantity_as_per_accepted", "Balance Quantity (as per Accepted)"]),
      // balanceValueAsPerAccepted: getTranzactString(item, ["balance_value_as_per_accepted", "Balance Value (as per Accepted)"]),
      invoiceQuantity: getTranzactString(item, ["invoice_quantity", "Invoice Quantity"]),
      // inwardInvoiceMismatch: getTranzactString(item, ["inward_invoice_mismatch", "Inward-Invoice Mismatch"]),
      drafterName: getTranzactString(item, ["drafter_name", "Drafter Name"]),
      // senderName: getTranzactString(item, ["creator_name", "sender_name", "Sender Name"]),
      // paymentTerm: getTranzactString(item, ["payment_terms_name", "payment_term", "Payment Term"]),
      storeName: getTranzactString(item, ["buyer_store_name", "store_name", "Store Name"]),
      // poDeliveryDate: getTranzactString(item, ["po_delivery_date", "PO Delivery Date"]),
      // kindAttention: getTranzactString(item, ["kind_attention", "Kind Attention"]),
      poGrandTotal: getTranzactString(item, ["po_grand_total", "grand_total", "PO Grand Total"]),
      // networkTags: getTranzactString(item, ["network_tag", "Network Tags"]),
      // transactionTags: getTranzactString(item, ["transaction_tag", "Transaction Tags"]),
      documentSerialNumber: getTranzactString(item, ["document_serial_number", "Document Serial Number"]),
      // customerDeliveryAddressName: getTranzactString(item, ["customer_delivery_location_name", "customer_delivery_address_name", "Customer Delivery Address Name"]),
      // customerDeliveryAddress: getTranzactString(item, ["customer_delivery_address", "Customer Delivery Address"]),
      // customerDeliveryAddressGstin: getTranzactString(item, ["customer_delivery_address_gstin", "Customer Delivery Address GSTIN"]),
      // customerDeliveryAddressCity: getTranzactString(item, ["customer_delivery_address_city", "Customer Delivery Address City"]),
      // customerDeliveryAddressState: getTranzactString(item, ["customer_delivery_address_state", "Customer Delivery Address State"]),
      // customerDeliveryAddressCountry: getTranzactString(item, ["customer_delivery_address_country", "Customer Delivery Address Country"]),
      // customerDeliveryAddressPin: getTranzactString(item, ["customer_delivery_address_pin", "Customer Delivery Address PIN"]),
      // customerBillingAddressGstin: getTranzactString(item, ["customer_billing_address_gstin", "Customer Billing Address GSTIN"]),
      // poOriginalCreationTimestamp: getTranzactString(item, ["po_original_creation_timestamp", "PO Original Creation Timestamp"]),
      // poLastModifiedTimestamp: getTranzactString(item, ["po_last_modified_timestamp", "PO Last Modified Timestamp"]),
      transactionId: getTranzactString(item, ["transaction_id", "document_id", "Transaction ID"]),
      rowData: JSON.parse(JSON.stringify(item)) as Prisma.InputJsonValue,
   }))
}

export async function saveTranzactPurchaseOrderData(dataArray: TranzactPurchaseOrderReport[]) {
   const formattedData = await TransactPurchaseOrderRowForOutput(dataArray)

   if (formattedData.length === 0) {
      return { count: 0 }
   }

   console.log("Saving Tranzact Purchase Order Data:", formattedData.length, "rows")
   const [, saved] = await prisma.$transaction([
      prisma.purchaseOrderTranzactData.deleteMany(),
      prisma.purchaseOrderTranzactData.createMany({
         data: formattedData,
      }),
   ])

   return saved
}
