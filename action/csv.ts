"use server"

import { unstable_noStore as noStore } from "next/cache"
import { parse } from "csv-parse/sync"
import { analysis, calc_Count_Amt, orderCategory } from "@/lib/action-utils"
import type { categorySizeMap } from "@/components/categories/data-table-filters"
import { filterInvoices, invoiceGradeAnalysis } from "@/lib/invoice-action-utils"
import { roundToDecimals, safeNumber } from "@/lib/utils"
import { cache } from "react"
import { calculateCategoryMetrics, calculatePortalMetrics } from "@/lib/category-poral-action-utils"
import type { SalesRecord } from "@/types/category-poral-monthly"
import { getDaysInMonth } from "date-fns"
import { getJobStatus } from "@/lib/api"
import prisma from "@/lib/prisma"
import { convertPriceCheckData } from "./db_action"
import { FILENAME } from "@prisma/client"

// Constants
// const CACHE_REVALIDATION_PATH = process.env.CACHE_REVALIDATION_PATH || "/analysis"
// const MAX_ATTEMPTS = Number.parseInt(process.env.MAX_ATTEMPTS || "100", 100)
// const DELAY = Number.parseInt(process.env.DELAY || "2000", 2000)

export async function pollJobStatus(jobCode: string, maxAttempts: number, delay: number) {
    noStore()
    let attempts = 0
    while (attempts < maxAttempts) {
        const statusResponse = await getJobStatus(jobCode)
        if (statusResponse.status === "COMPLETE") {
            return { success: true, message: "Export completed successfully", filePath: statusResponse.filePath }
        } else if (statusResponse.status === "FAILED") {
            throw new Error(`Export job failed: ${JSON.stringify(statusResponse)}`)
        }
        await new Promise((resolve) => setTimeout(resolve, delay))
        attempts++
    }
    throw new Error("Export job timed out")
}

// interface PaginatedResponse<T> {
//     columns: string[]
//     rows: T[]
//     hasMore: boolean
//     totalItems: number
// }

// class DataCache<T> {
//     private data: T[] = []
//     private columns: string[] = []
//     private map: Map<string, T> = new Map()

//     isEmpty(): boolean {
//         return this.data.length === 0
//     }

//     setData(data: T[], columns?: string[]) {
//         this.data = data
//         if (columns) this.columns = columns
//         this.map = new Map(data.map((item, index) => [index.toString(), item]))
//     }

//     getData(): T[] {
//         return this.data
//     }

//     getColumns(): string[] {
//         return this.columns
//     }

//     slice(start: number, end: number): T[] {
//         return Array.from({ length: end - start }, (_, i) => this.map.get((i + start).toString())!).filter(Boolean)
//     }

//     length(): number {
//         return this.data.length
//     }
// }

// Initialize caches
// const invoiceAnalysisCache = new DataCache<InvoiceData>()
// const salesCache = new DataCache<SalesDataItem>()
// const monthlyCache = new DataCache<MonthDataItem>()
// const monthlyAnalysisCache = new DataCache<MonthDataItem>()

// Not in use: copied to /api/cron/morning-cron
// export async function exportInvoices(): Promise<{
//     success: boolean;
//     message: string;
//     filePath?: string;
//     error?: string;
// }> {
//     try {
//         const today = new Date()
//         const yesterday = format(new Date().setDate(today.getDate() - 1), "yyyy-MM-dd")
//         const dayBeforeYesterday = format(new Date().setDate(today.getDate() - 2), "yyyy-MM-dd")

//         const jobResponse = await createInvoiceJob(dayBeforeYesterday, yesterday)

//         if (!jobResponse.successful) {
//             throw new Error(`Failed to create export job: ${JSON.stringify(jobResponse)}`)
//         }

//         const jobCode = jobResponse.jobCode

//         // Poll for job status
//         const result = await pollJobStatus(jobCode, MAX_ATTEMPTS, DELAY)
//         return result
//     } catch (error) {
//         return {
//             success: false,
//             message: error instanceof Error ? error.message : "An unknown error occurred",
//             error: error instanceof Error ? error.stack : String(error),
//         }
//     }
// }

// Not in use: copied to /api/cron
// export async function exportMonthlyReport(): Promise<{
//     success: boolean;
//     message: string;
//     filePath?: string;
//     error?: string;
// }> {
//     try {
//         noStore();
//         const jobResponse = await createMontlyReportJob()

//         if (!jobResponse.successful) {
//             throw new Error(`Failed to create export job: ${JSON.stringify(jobResponse)}`)
//         }

//         const jobCode = jobResponse.jobCode

//         // Poll for job status
//         const result = await pollJobStatus(jobCode, MAX_ATTEMPTS, DELAY * 4) // Increased delay and attempts for monthly report
//         return result
//     } catch (error) {
//         return {
//             success: false,
//             message: error instanceof Error ? error.message : "An unknown error occurred",
//             error: error instanceof Error ? error.stack : String(error),
//         }
//     }
// }

// Utility functions

export async function fetchCSV<T>(url: string): Promise<T[]> {
    const response = await fetch(url, {
        headers: { "Content-Type": "text/csv" },
        cache: "no-cache"
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    return processCSVData(csvText)
}

function processCSVData<T>(csvText: string): T[] {
    return parse(csvText, {
        columns: true,
        skip_empty_lines: true,
    }) as T[]
}

// export async function fetchSalesData(startIndex: number, stopIndex: number): Promise<PaginatedResponse<SalesDataItem>> {
//     try {
//         // if (salesCache.isEmpty()) {
//         //     const path = (await exportInvoices()).filePath
//         //     if (path) {
//         //         const result = await fetchCSV<SalesDataItem>(path)
//         //         salesCache.setData(result, Object.keys(result[0]))
//         //     }
//         // }

//         // const rows = salesCache.slice(startIndex, stopIndex)
//         // revalidatePath(CACHE_REVALIDATION_PATH)

//         const data = await convertPriceCheckData()
//         invoiceAnalysisCache.setData(data)

//         return {
//             columns: invoiceAnalysisCache.getColumns(),
//             rows: invoiceAnalysisCache.slice(startIndex, stopIndex),
//             hasMore: stopIndex < invoiceAnalysisCache.length(),
//             totalItems: invoiceAnalysisCache.length(),
//         }
//     } catch (error) {
//         console.error("Error in fetchSalesData:", error)
//         throw new Error("Failed to fetch sales data")
//     }
// }

export async function fetchMonthlyData() {

    try {
        // if (monthlyCache.isEmpty()) {

        // const path = (await exportMonthlyReport()).filePath
        // if (path) {
        //     const result = await fetchCSV<MonthDataItem>(path)
        //     monthlyCache.setData(result)
        // }
        // }

        // const transformedData = transformData(monthlyCache.getData())
        const monthlyData = await prisma.monthDataItem.findMany({
            orderBy: [
                {
                    saleQty: 'desc',
                }
            ],
            // take: 100,
        });
        return monthlyData.map((x) => ({
            "id": x.id,
            "Sku Code": x.skuCode,
            "Sale Qty": safeNumber(x.saleQty),
            "DOH": safeNumber(x.doh),
            "ROS": safeNumber(x.ros),
            "Available Inventory": x.availableInventory,
            "Static Grade": x.staticGrade,
            "Month Grade": x.monthGrade,
            "Required Qty": x.requiredQty,
            "Order Qty": x.orderQty,
            "Parent SKU": x.parentSKU,
            "Size": x.size,
            "Category Name": x.categoryName,
            "Sub Category": x.subCategory,
            "Sale Amount": safeNumber(x.saleAmount),
            "Vendor Name": x.vendorName,
            "Open Purchase": x.openPurchase,
            "Sale Through": x.saleThrough,
            "Vendor Price": x.vendorPrice,
            "Total Amount": x.totalAmount,
            "Sku Code ID ": x.skuCodeID,
            "Days of positive inventory": x.daysOfPositiveInventory,
            "New SKU Code": x.newSkuCode,
            "Static Grade_N": safeNumber(x.staticGradeN),
            "Month Grade_N": safeNumber(x.monthGradeN),
            "Comment": x.comment,
            "Avg Selling Price": safeNumber(x.avgSellingPrice),
            "Multiple Price": safeNumber(x.multiplePrice),
            "Remarks": `${x?.remarks ?? ""}`,
        }))

        // return {
        //     columns: Object.keys(monthlyAnalysisCache.getData()[0] || {}),
        //     rows: monthlyAnalysisCache.slice(startIndex, stopIndex),
        //     hasMore: stopIndex < monthlyAnalysisCache.length(),
        //     totalItems: monthlyAnalysisCache.length(),
        // }
    } catch (error) {
        console.error("Error in fetchMonthlyData:", error)
        throw new Error("Failed to fetch monthly data")
    }
}

export async function analysisData(key: string) {
    try {
        // if (monthlyAnalysisCache.isEmpty()) {
        //     await fetchMonthlyData(0, 50)
        // }

        const data = (await fetchMonthlyData()) || []

        return analysis(data, key)
    } catch (error) {
        console.error("Error in analysisData:", error)
        throw new Error("Failed to analyze data")
    }
}

export async function analysisDasboard() {
    try {
        const data = (await fetchMonthlyData()) || []
        return calc_Count_Amt(data)
    } catch (error) {
        console.error("Error in analysisData:", error)
        throw new Error("Failed to analyze data")
    }
}

export async function categoryData(key: keyof typeof categorySizeMap) {
    try {
        const data = (await fetchMonthlyData()) || []

        return orderCategory(data, key)
    } catch (error) {
        console.error("Error in analysisData:", error)
        throw new Error("Failed to analyze data")
    }
}

/**************Invoice Data (Price Checklist)**************/
// export async function fetchInvoiceData(startIndex: number, stopIndex: number): Promise<PaginatedResponse<InvoiceData>> {

//     try {
//         if (invoiceCache.isEmpty()) {
//             const path = (await exportInvoices()).filePath
//             if (path) {
//                 const result = await fetchCSV<InvoiceData>(path)
//                 invoiceCache.setData(result, Object.keys(result[0]))
//             }
//         }

//         const rows = invoiceCache.slice(startIndex, stopIndex)

//         return {
//             columns: invoiceCache.getColumns(),
//             rows,
//             hasMore: stopIndex < invoiceCache.length(),
//             totalItems: invoiceCache.length(),
//         }
//     } catch (error) {
//         console.error("Error in fetchInvoiceData:", error)
//         throw new Error("Failed to fetchInvoiceData")
//     }
// }

export async function priceCheckListData(type: string) {
    try {
        // Get current date and time in India timezone (UTC+5:30)
        const indiaOptions = { timeZone: 'Asia/Kolkata' };
        const indiaNow = new Date(new Date().toLocaleString('en-US', indiaOptions));

        const year = indiaNow.getFullYear();
        const month = indiaNow.getMonth();
        const todayDate = indiaNow.getDate();

        // Check if today is Monday in India timezone
        const isTodayMonday = indiaNow.getDay() === 1;

        // Set yesterday's start and end times (if Monday, use Saturday data)
        const daysToSubtract = isTodayMonday ? 2 : 1;

        // Create dates in India timezone
        // const yesterdayStart = new Date(year, month, todayDate - daysToSubtract, 11, 30, 1);
        // const yesterdayEnd = new Date(year, month, todayDate - daysToSubtract, 23, 59, 59);
        const CurrentDateStart = new Date(year, month, todayDate, 0, 0, 0);
        const CurrentDateEnd = new Date(year, month, todayDate,23, 59, 59);
        console.log('Filter date : ' + CurrentDateStart, CurrentDateEnd + ' Filter date end');
        
        const data = await convertPriceCheckData();
        // console.log(data)

        const yesterdayData = filterInvoices(data, CurrentDateStart, CurrentDateEnd);

        switch (type) {
            case "overview":
                return yesterdayData;
            case "analysis":
                return invoiceGradeAnalysis(yesterdayData);
            case "stop":
                return yesterdayData.filter(({ Status }) => Status?.toUpperCase() === "STOP");
            case "under300":
                return yesterdayData.filter((item) => safeNumber(item['Total Selling Price']) < 300);
            case "check":
                return yesterdayData.filter((item) => safeNumber(item['Total Selling Price']) > 300);
            default:
                throw new Error("Invalid request type");
        }
    } catch (error) {
        console.error(error);
        throw new Error("Failed to analyze data");
    }
}

const invoiceHeaders: string[] = [
    "Order No", "Invoice No", "Shipping Package Code", "Shipping Package Status Code",
    "Invoice Created Date", "Channel Invoice Created Date", "EWayBill No", "EWayBill Date",
    "EWayBill Valid Till", "Customer Name", "SKU Code", "SKU Name", "Quantity", "Invoice Tax",
    "Invoice Total", "Invoice Cancelled", "HSN Code", "GST Tax Type Code", "Tax Type Code",
    "CGST", "IGST", "SGST", "UTGST", "VAT", "CST", "Additional Tax", "Additional Tax Percentage",
    "Tax Percentage", "CESS", "CGST Rate", "IGST Rate", "SGST Rate", "UTGST Rate", "CESS Rate",
    "Shipping Charge", "COD Charge", "TCS Amount", "Channel Name", "Uniware Invoice Code",
    "Adjustment In Selling Price", "Adjustment In Discount", "Grade", "MRP", "Color", "Brand",
    "Size", "Seller Sku Code", "Cost Price"
];

/**************Category and Portal**************/
export const categoryPortalData = cache(async (type: string) => {
    const transformedData = await convertPriceCheckData()

    // Get current date
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDate = now.getDate();
    const isTodayMonday = now.getDay() === 1;

    const todayStart = new Date(year, month, todayDate, 0, 0, 0);  // 00:00:00 today
    const todayEnd = new Date(year, month, todayDate, 23, 59, 59);  // 11:30:00 today

    const yesterdayStart = new Date(year, month, todayDate - (isTodayMonday ? 2 : 1), 11, 30, 0);  // 11:30:00 yesterday
    const yesterdayEnd = new Date(year, month, todayDate - (isTodayMonday ? 2 : 1), 23, 59, 59);   // 23:59:59 yesterday

    const todayData = filterInvoices(transformedData, todayStart, todayEnd);
    const yesterdayData = filterInvoices(transformedData, yesterdayStart, yesterdayEnd);

    if (type === "rawdata") return { rows: transformedData, cols: invoiceHeaders }
    if (type === "yesterday") return yesterdayData
    if (type === "today") return todayData
    if (type === "portal") return calculatePortalMetrics(yesterdayData, todayData)
    if (type === "category") return calculateCategoryMetrics(yesterdayData, todayData)
})

export const calculateCategoryMonthlyReport = async (formData: FormData) => {
    try {
        const file = formData.get("file") as File
        if (!file) {
            throw new Error("No file uploaded")
        }
        const data: SalesRecord[] = processCSVData(await file.text())

        const productMap = new Map()

        data.forEach((record) => {
            const productName = record["Product Name"]
            const quantity = safeNumber(record["Qty"])

            if (productMap.has(productName)) {
                productMap.set(productName, productMap.get(productName) + quantity)
            } else {
                productMap.set(productName, quantity)
            }
        })

        const daysInCurrentMonth = getDaysInMonth(new Date())

        const result = Array.from(productMap, ([productName, quantity]) => ({
            name: productName,
            quantity,
            monthAvg: roundToDecimals(safeNumber((quantity / daysInCurrentMonth))).toString(),
            reportfileName: FILENAME.CATEGORY
        }))

        await prisma.tallyReportT.deleteMany({
            where: {
                reportfileName: FILENAME.CATEGORY
            }
        })
        await prisma.tallyReportT.createMany({
            data: result
        })

        result.sort((a, b) => a.name.localeCompare(b.name))

        return result
    } catch {
        return null
    }
}

export const calculatePortalMonthlyReport = async (formData: FormData) => {
    try {
        const file = formData.get("file") as File
        if (!file) {
            throw new Error("No file uploaded")
        }
        const data: SalesRecord[] = processCSVData(await file.text())

        const productMap = new Map()

        data.forEach((record) => {
            const productName = record["Channel Ledger"]
            const quantity = safeNumber(record["Qty"])

            if (productMap.has(productName)) {
                productMap.set(productName, productMap.get(productName) + quantity)
            } else {
                productMap.set(productName, quantity)
            }
        })

        const daysInCurrentMonth = getDaysInMonth(new Date())

        const result = Array.from(productMap, ([productName, quantity]) => ({
            name: productName,
            quantity,
            monthAvg: roundToDecimals(safeNumber((quantity / daysInCurrentMonth))).toString(),
            reportfileName: FILENAME.PORTAL
        }))

        await prisma.tallyReportT.deleteMany({
            where: {
                reportfileName: FILENAME.PORTAL
            }
        })
        await prisma.tallyReportT.createMany({
            data: result
        })

        result.sort((a, b) => a.name.localeCompare(b.name))

        return result
    } catch (e) {
        console.log(e);

        return null
    }
}

/**************Channel-itme-type-report**************/
export async function getChannelItemTypeReport() {

    return await prisma.channelItemReport.findMany({
        select: { 
            channel_name: true,
            product_name: true,
            channel_product_id: true,
            seller_sku_code: true,
            status_code: true,
            selling_price: true,
            max_retail_price: true,
        }
    })
}
