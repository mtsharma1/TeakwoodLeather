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
import type { PriceCheckInvoiceData } from "@/types/order"
import { getDaysInMonth } from "date-fns"
import { createReturnInvoiceCourierJob, createReturnReverseJob, getJobStatus } from "@/lib/api"
import prisma from "@/lib/prisma"
import { convertPriceCheckData, convertReturnCourierData, convertReturnInvoiceData, convertReturnReverseData, saveReturnCourierData, saveReturnReverseData } from "./db_action"
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
        if (key === "portalwise") {
            return await priceChecklistPortalWiseData()
        }

        if (key === "categorywise") {
            return await inventoryCategoryWiseData()
        }

        if (key === "returninvoice") {
            return await persistedReturnInvoiceAnalysisData()
        }

        if (key === "returncourier") {
            try {
                return await persistedReturnCourierAnalysisData()
            } catch (error) {
                console.error("returncourier analysis failed:", error)
                return { rows: [], cols: [] }
            }
        }

        if (key === "returnreverse") {
            try {
                return await persistedReturnReverseAnalysisData()
            } catch (error) {
                console.error("returnreverse analysis failed:", error)
                return { rows: [], cols: [] }
            }
        }

        // if (monthlyAnalysisCache.isEmpty()) {
        //     await fetchMonthlyData(0, 50)
        // }

        const data = (await fetchMonthlyData()) || []

        return analysis(data, key)
    } catch (error) {
        console.error("Error in analysisData:", error)
        if (key.startsWith("return")) {
            return { rows: [], cols: [] }
        }
        throw new Error("Failed to analyze data")
    }
}

async function priceChecklistPortalWiseData() {
    const overviewData = await priceCheckListData("overview") as PriceCheckInvoiceData[]

    const groupedData = overviewData.reduce((acc, item) => {
        const channelName = item["Channel Name"]?.trim() || "Unknown"

        if (!acc[channelName]) {
            acc[channelName] = {
                "Channel Name": channelName,
                "Quantity": 0,
                "Invoice Total": 0,
            }
        }

        acc[channelName]["Quantity"] += safeNumber(item["Quantity"])
        acc[channelName]["Invoice Total"] += safeNumber(item["Invoice Total"])

        return acc
    }, {} as Record<string, {
        "Channel Name": string
        "Quantity": number
        "Invoice Total": number
    }>)

    const rows = Object
        .values(groupedData)
        .map((item) => ({
            ...item,
            "Quantity": roundToDecimals(item["Quantity"]),
            "Invoice Total": roundToDecimals(item["Invoice Total"]),
        }))
        .sort((a, b) => b["Quantity"] - a["Quantity"])

    return {
        rows,
        cols: ["Channel Name", "Quantity", "Invoice Total"],
    }
}

async function inventoryCategoryWiseData() {
    const rawData = await fetchMonthlyData()

    const groupedData = rawData.reduce((acc, item) => {
        const subCategory = item["Sub Category"]?.trim() || "Unknown"

        if (!acc[subCategory]) {
            acc[subCategory] = {
                "Sub Category": subCategory,
                "Sale Qty": 0,
                "Sale Amount": 0,
            }
        }

        acc[subCategory]["Sale Qty"] += safeNumber(item["Sale Qty"])
        acc[subCategory]["Sale Amount"] += safeNumber(item["Sale Amount"])

        return acc
    }, {} as Record<string, {
        "Sub Category": string
        "Sale Qty": number
        "Sale Amount": number
    }>)

    const rows = Object
        .values(groupedData)
        .map((item) => ({
            ...item,
            "Sale Qty": roundToDecimals(item["Sale Qty"]),
            "Sale Amount": roundToDecimals(item["Sale Amount"]),
        }))
        .sort((a, b) => b["Sale Qty"] - a["Sale Qty"])

    return {
        rows,
        cols: ["Sub Category", "Sale Qty", "Sale Amount"],
    }
}

async function persistedReturnInvoiceAnalysisData() {
    const rows = await convertReturnInvoiceData()

    return {
        rows,
        cols: Object.keys(rows[0] || {}),
    }
}

function getNormalizedValue(item: Record<string, string | number>, possibleKeys: string[]) {
    const normalizedKeys = possibleKeys.map((x) => x.replaceAll(" ", "").toLowerCase())

    for (const [key, value] of Object.entries(item)) {
        const normalizedKey = key.replaceAll(" ", "").toLowerCase()
        if (normalizedKeys.includes(normalizedKey)) {
            return `${value ?? ""}`.trim()
        }
    }

    return ""
}

async function persistedReturnCourierAnalysisData() {
    let allRows: Record<string, string | number>[] = []
    try {
        allRows = await convertReturnCourierData() as unknown as Record<string, string | number>[]
    } catch {
        allRows = []
    }

    if (allRows.length === 0) {
        try {
            const rawRows = await fetchReturnInvoiceRowsForAnalysis()
            if (rawRows.length > 0) {
                await saveReturnCourierData(rawRows)
            }
            allRows = rawRows
        } catch (error) {
            // Keep UI usable even if API/download fails.
            console.error("Courier fallback fetch failed:", error)
            allRows = []
        }
    }

    const filteredRows = applyCourierFilter(allRows)

    return {
        rows: filteredRows,
        cols: Object.keys(filteredRows[0] || {}),
    }
}

async function persistedReturnReverseAnalysisData() {
    let allRows: Record<string, string | number>[] = []
    try {
        allRows = await convertReturnReverseData() as unknown as Record<string, string | number>[]
    } catch {
        allRows = []
    }

    if (allRows.length === 0) {
        try {
            const rawRows = await fetchReturnReverseRowsForAnalysis()
            if (rawRows.length > 0) {
                await saveReturnReverseData(rawRows)
            }
            allRows = rawRows
        } catch (error) {
            // Keep UI usable even if API/download fails.
            console.error("Reverse fallback fetch failed:", error)
            allRows = []
        }
    }

    const filteredRows = applyReverseFilter(allRows)

    return {
        rows: filteredRows,
        cols: Object.keys(filteredRows[0] || {}),
    }
}

function applyCourierFilter(rawRows: Record<string, string | number>[]) {
    return rawRows.filter((item) => {
        const shippingStatus = normalizeStatusToken(
            getNormalizedValue(item, ["Shipping Package Status", "shippingPackageStatus", "Shipping Package Status Code", "shippingPackageStatusCode"])
        )
        const putawayStatus = getNormalizedValue(item, ["Putaway Status", "putawayStatus"])
        return shippingStatus === "RETURN_EXPECTED" && isBlankLike(putawayStatus)
    })
}

function applyReverseFilter(rawRows: Record<string, string | number>[]) {
    return rawRows.filter((item) => {
        const shippingStatus = normalizeStatusToken(
            getNormalizedValue(item, ["Reverse Pickup Status", "reversePickupStatus"])
        )
        const putawayStatus = getNormalizedValue(item, ["Putaway Status", "putawayStatus"])
        return shippingStatus === "CREATED" && isBlankLike(putawayStatus)
    })
}

function isBlankLike(value: string) {
    const normalized = value.trim().toUpperCase()
    return normalized === "" || normalized === "-" || normalized === "NULL" || normalized === "NA" || normalized === "N/A"
}

function normalizeStatusToken(value: string) {
    return value.trim().toUpperCase().replace(/[\s-]+/g, "_")
}

async function fetchReturnInvoiceRowsForAnalysis() {
    const jobResponse = await createReturnInvoiceCourierJob()

    if (!jobResponse?.successful || !jobResponse?.jobCode) {
        throw new Error("Failed to create return invoice export job")
    }

    const result = await pollJobStatus(jobResponse.jobCode, 100, 2000 * 4)

    if (!result?.filePath) {
        throw new Error("Return invoice export did not provide a file path")
    }

    return await fetchCSV<Record<string, string | number>>(result.filePath)
}

async function fetchReturnReverseRowsForAnalysis() {
    const jobResponse = await createReturnReverseJob()

    if (!jobResponse?.successful || !jobResponse?.jobCode) {
        throw new Error("Failed to create reverse pickup export job")
    }

    const result = await pollJobStatus(jobResponse.jobCode, 100, 2000 * 4)

    if (!result?.filePath) {
        throw new Error("Reverse pickup export did not provide a file path")
    }

    return await fetchCSV<Record<string, string | number>>(result.filePath)
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
