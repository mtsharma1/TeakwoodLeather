'use server'

import prisma from "@/lib/prisma"
import { roundToDecimals, safeNumber } from "@/lib/utils"
import { MonthDataItem, PriceCheckInvoiceData, ProductData } from "@/types/order"
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