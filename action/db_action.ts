'use server'

import prisma from "@/lib/prisma"
import { roundToDecimals, safeNumber } from "@/lib/utils"
import { MonthDataItem, PriceCheckInvoiceData, ProductData, ReturnCourierData, ReturnInvoiceData, ReturnReverseData } from "@/types/order"
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

      await prisma.monthDataItem.deleteMany()

      const result = await prisma.monthDataItem.createMany({
         data,
      })

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

   await prisma.$transaction([
      prisma.returnInvoiceData.deleteMany(),
      prisma.returnInvoiceData.createMany({ data: formattedData }),
   ])
}

export async function convertReturnInvoiceData(): Promise<ReturnInvoiceData[]> {
   const returnInvoiceData = await prisma.returnInvoiceData.findMany({
      orderBy: [
         {
            returnedDate: "desc",
         },
      ],
   })

   return returnInvoiceData.map(mapReturnInvoiceRowForOutput)
}

export async function saveReturnCourierData(dataArray: Record<string, string | number>[]) {
   const formattedData = mapReturnInvoiceRowsForStorage(dataArray)
   const prismaAny = prisma as unknown as Record<string, unknown>
   const delegate = prismaAny.returnCourierData as
      | { deleteMany: () => Promise<unknown>; createMany: (args: { data: ReturnType<typeof mapReturnInvoiceRowsForStorage> }) => Promise<unknown> }
      | undefined

   if (delegate?.deleteMany && delegate?.createMany) {
      await delegate.deleteMany()
      await delegate.createMany({ data: formattedData })
      return
   }

   await saveReturnDataWithRawSql("ReturnCourierData", formattedData)
}

export async function convertReturnCourierData(): Promise<ReturnCourierData[]> {
   const prismaAny = prisma as unknown as Record<string, unknown>
   const delegate = prismaAny.returnCourierData as
      | { findMany: (args: { orderBy: { returnedDate: "desc" }[] }) => Promise<Array<Parameters<typeof mapReturnInvoiceRowForOutput>[0]>> }
      | undefined

   const returnCourierData = delegate?.findMany
      ? await delegate.findMany({
         orderBy: [
            {
               returnedDate: "desc",
            },
         ],
      })
      : await fetchReturnDataWithRawSql("ReturnCourierData")

   return returnCourierData.map(mapReturnInvoiceRowForOutput)
}

export async function saveReturnReverseData(dataArray: Record<string, string | number>[]) {
   const formattedData = mapReturnReverseRowsForStorage(dataArray)
   await saveReturnReverseDataWithRawSql(formattedData)
}

export async function convertReturnReverseData(): Promise<ReturnReverseData[]> {
   const returnReverseData = await fetchReturnReverseDataWithRawSql()

   return returnReverseData.map(mapReturnReverseRowForOutput)
}

type ReturnStorageRow = ReturnType<typeof mapReturnInvoiceRowsForStorage>[number]

async function saveReturnDataWithRawSql(
   tableName: "ReturnCourierData",
   rows: ReturnStorageRow[],
) {
   await prisma.$executeRawUnsafe(`DELETE FROM \`${tableName}\``)

   if (rows.length === 0) {
      return
   }

   for (const row of rows) {
      await prisma.$executeRawUnsafe(
         `INSERT INTO \`${tableName}\` (
            \`Display Order Code\`,
            \`Invoice Code\`,
            \`Return Invoice Code\`,
            \`Shipping Package Code\`,
            \`Shipping Package Status Code\`,
            \`Putaway Status\`,
            \`Returned Date\`,
            \`Customer Name\`,
            \`SKU Code\`,
            \`Item Type Name\`,
            \`Qty\`,
            \`Transfer Price\`,
            \`CGST\`,
            \`IGST\`,
            \`SGST\`,
            \`UTGST\`,
            \`CESS\`,
            \`CGST Rate\`,
            \`IGST Rate\`,
            \`SGST Rate\`,
            \`UTGST Rate\`,
            \`CESS Rate\`
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
         row.displayOrderCode,
         row.invoiceCode,
         row.returnInvoiceCode,
         row.shippingPackageCode,
         row.shippingPackageStatusCode,
         row.putawayStatus,
         row.returnedDate,
         row.customerName,
         row.skuCode,
         row.itemTypeName,
         row.qty,
         row.transferPrice,
         row.cgst,
         row.igst,
         row.sgst,
         row.utgst,
         row.cess,
         row.cgstRate,
         row.igstRate,
         row.sgstRate,
         row.utgstRate,
         row.cessRate,
      )
   }
}

async function fetchReturnDataWithRawSql(
   tableName: "ReturnCourierData",
): Promise<Array<Parameters<typeof mapReturnInvoiceRowForOutput>[0]>> {
   const rows = await prisma.$queryRawUnsafe<Array<Parameters<typeof mapReturnInvoiceRowForOutput>[0]>>(
      `SELECT
         \`Display Order Code\` AS displayOrderCode,
         \`Invoice Code\` AS invoiceCode,
         \`Return Invoice Code\` AS returnInvoiceCode,
         \`Shipping Package Code\` AS shippingPackageCode,
         \`Shipping Package Status Code\` AS shippingPackageStatusCode,
         \`Putaway Status\` AS putawayStatus,
         \`Returned Date\` AS returnedDate,
         \`Customer Name\` AS customerName,
         \`SKU Code\` AS skuCode,
         \`Item Type Name\` AS itemTypeName,
         \`Qty\` AS qty,
         \`Transfer Price\` AS transferPrice,
         \`CGST\` AS cgst,
         \`IGST\` AS igst,
         \`SGST\` AS sgst,
         \`UTGST\` AS utgst,
         \`CESS\` AS cess,
         \`CGST Rate\` AS cgstRate,
         \`IGST Rate\` AS igstRate,
         \`SGST Rate\` AS sgstRate,
         \`UTGST Rate\` AS utgstRate,
         \`CESS Rate\` AS cessRate
      FROM \`${tableName}\`
      ORDER BY \`Returned Date\` DESC`
   )

   return rows ?? []
}

type ReturnReverseStorageRow = ReturnType<typeof mapReturnReverseRowsForStorage>[number]

async function saveReturnReverseDataWithRawSql(rows: ReturnReverseStorageRow[]) {
   await prisma.$executeRawUnsafe("DELETE FROM `ReturnReverseData`")

   if (rows.length === 0) {
      return
   }

   for (const row of rows) {
      await prisma.$executeRawUnsafe(
         `INSERT INTO \`ReturnReverseData\` (
            \`Sale Order Item Code\`,
            \`Sale Order Created\`,
            \`Sale Order Code\`,
            \`Item Type Name\`,
            \`Item Type SKU\`,
            \`Reverse Pickup Code\`,
            \`Tracking Number\`,
            \`Dispatched Date\`,
            \`Reference Code\`,
            \`Import Reference Id\`,
            \`Reverse Pickup Created\`,
            \`Reverse Pickup Updated\`,
            \`Reverse Pickup Status\`,
            \`Reverse Pickup Action\`,
            \`Return Reason\`,
            \`Customer Image Url\`,
            \`Replacement Sale Order Code\`,
            \`Channel\`,
            \`Total Received Items\`,
            \`QC Comments\`,
            \`Reverse Pickup Created By\`,
            \`Putaway Code\`,
            \`Created By\`,
            \`Putaway Status\`,
            \`Putaway Last Updated\`,
            \`Courier Provider Name\`,
            \`Return Item Status\`,
            \`Shipping Courier Status\`,
            \`Shipping Tracking Status\`,
            \`Item Seal Id\`,
            \`Return Delivery Date\`,
            \`Channel Return Created Date\`,
            \`Return Courier Name\`,
            \`Return Remarks\`,
            \`createdAt\`,
            \`updatedAt\`
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
         row.saleOrderItemCode,
         row.saleOrderCreated,
         row.saleOrderCode,
         row.itemTypeName,
         row.itemTypeSku,
         row.reversePickupCode,
         row.trackingNumber,
         row.dispatchedDate,
         row.referenceCode,
         row.importReferenceId,
         row.reversePickupCreated,
         row.reversePickupUpdated,
         row.reversePickupStatus,
         row.reversePickupAction,
         row.returnReason,
         row.customerImageUrl,
         row.replacementSaleOrderCode,
         row.channel,
         row.totalReceivedItems,
         row.qcComments,
         row.reversePickupCreatedBy,
         row.putawayCode,
         row.createdBy,
         row.putawayStatus,
         row.putawayLastUpdated,
         row.courierProviderName,
         row.returnItemStatus,
         row.shippingCourierStatus,
         row.shippingTrackingStatus,
         row.itemSealId,
         row.returnDeliveryDate,
         row.channelReturnCreatedDate,
         row.returnCourierName,
         row.returnRemarks,
      )
   }
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
