"use server"

import { revalidatePath, unstable_noStore } from "next/cache"
import { parse } from "csv-parse/sync"
import { analysis, calc_Count_Amt, orderCategory, transformData } from "@/lib/action-utils"
import type { InvoiceData, MonthDataItem, SalesDataItem } from "@/types/order"
import type { categorySizeMap } from "@/components/categories/data-table-filters"
import { invoiceGradeAnalysis, transformInvoiceData } from "@/lib/invoice-action-utils"
import { roundToDecimals, safeNumber } from "@/lib/utils"
import { cache } from "react"
import { calculateCategoryMetrics, calculatePoralMetrics } from "@/lib/category-poral-action-utils"
import type { SalesRecord } from "@/types/category-poral-monthly"
import { format, getDaysInMonth } from "date-fns"
import { createInvoiceJob, createMontlyReportJob, getJobStatus } from "@/lib/api"

// Constants
const CACHE_REVALIDATION_PATH = process.env.CACHE_REVALIDATION_PATH || "/analysis"
const MAX_ATTEMPTS = Number.parseInt(process.env.MAX_ATTEMPTS || "10", 10)
const DELAY = Number.parseInt(process.env.DELAY || "2000", 10)

async function pollJobStatus(jobCode: string, maxAttempts: number, delay: number) {
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

interface PaginatedResponse<T> {
    columns: string[]
    rows: T[]
    hasMore: boolean
    totalItems: number
}

class DataCache<T> {
    private data: T[] = []
    private columns: string[] = []
    private map: Map<string, T> = new Map()

    isEmpty(): boolean {
        return this.data.length === 0
    }

    setData(data: T[], columns?: string[]) {
        this.data = data
        if (columns) this.columns = columns
        this.map = new Map(data.map((item, index) => [index.toString(), item]))
    }

    getData(): T[] {
        return this.data
    }

    getColumns(): string[] {
        return this.columns
    }

    slice(start: number, end: number): T[] {
        return Array.from({ length: end - start }, (_, i) => this.map.get((i + start).toString())!).filter(Boolean)
    }

    length(): number {
        return this.data.length
    }
}

// Initialize caches
const invoiceCache = new DataCache<InvoiceData>()
const invoiceAnalysisCache = new DataCache<InvoiceData>()
const salesCache = new DataCache<SalesDataItem>()
const monthlyCache = new DataCache<MonthDataItem>()
const monthlyAnalysisCache = new DataCache<MonthDataItem>()

export async function exportInvoices(): Promise<{
    success: boolean;
    message: string;
    filePath?: string;
    error?: string;
}> {
    try {
        const today = new Date()
        const yesterday = format(new Date().setDate(today.getDate() - 1), "yyyy-MM-dd")
        const dayBeforeYesterday = format(new Date().setDate(today.getDate() - 2), "yyyy-MM-dd")

        const jobResponse = await createInvoiceJob(dayBeforeYesterday, yesterday)

        if (!jobResponse.successful) {
            throw new Error(`Failed to create export job: ${JSON.stringify(jobResponse)}`)
        }

        const jobCode = jobResponse.jobCode

        // Poll for job status
        const result = await pollJobStatus(jobCode, MAX_ATTEMPTS, DELAY)
        return result
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred",
            error: error instanceof Error ? error.stack : String(error),
        }
    }
}

export async function exportMonthlyReport(): Promise<{
    success: boolean;
    message: string;
    filePath?: string;
    error?: string;
}> {
    try {
        const jobResponse = await createMontlyReportJob()

        if (!jobResponse.successful) {
            throw new Error(`Failed to create export job: ${JSON.stringify(jobResponse)}`)
        }

        const jobCode = jobResponse.jobCode

        // Poll for job status
        const result = await pollJobStatus(jobCode, MAX_ATTEMPTS, DELAY * 4) // Increased delay and attempts for monthly report
        return result
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unknown error occurred",
            error: error instanceof Error ? error.stack : String(error),
        }
    }
}

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

export async function fetchSalesData(startIndex: number, stopIndex: number): Promise<PaginatedResponse<SalesDataItem>> {
    try {
        if (salesCache.isEmpty()) {
            const path = (await exportInvoices()).filePath
            if (path) {
                const result = await fetchCSV<SalesDataItem>(path)
                salesCache.setData(result, Object.keys(result[0]))
            }
        }

        const rows = salesCache.slice(startIndex, stopIndex)
        revalidatePath(CACHE_REVALIDATION_PATH)

        return {
            columns: salesCache.getColumns(),
            rows,
            hasMore: stopIndex < salesCache.length(),
            totalItems: salesCache.length(),
        }
    } catch (error) {
        console.error("Error in fetchSalesData:", error)
        throw new Error("Failed to fetch sales data")
    }
}

export async function fetchMonthlyData(
    startIndex: number,
    stopIndex: number,
): Promise<PaginatedResponse<MonthDataItem>> {
    // Disable static rendering
    unstable_noStore()

    try {
        if (monthlyCache.isEmpty()) {
            const path = (await exportMonthlyReport()).filePath
            if (path) {
                const result = await fetchCSV<MonthDataItem>(path)
                monthlyCache.setData(result)
            }
        }

        const transformedData = transformData(monthlyCache.getData())
        monthlyAnalysisCache.setData(transformedData)

        return {
            columns: Object.keys(monthlyAnalysisCache.getData()[0] || {}),
            rows: monthlyAnalysisCache.slice(startIndex, stopIndex),
            hasMore: stopIndex < monthlyAnalysisCache.length(),
            totalItems: monthlyAnalysisCache.length(),
        }
    } catch (error) {
        console.error("Error in fetchMonthlyData:", error)
        throw new Error("Failed to fetch monthly data")
    }
}

export async function analysisData(key: string) {
    try {
        if (monthlyAnalysisCache.isEmpty()) {
            await fetchMonthlyData(0, 50)
        }

        return analysis(monthlyAnalysisCache.getData(), key)
    } catch (error) {
        console.error("Error in analysisData:", error)
        throw new Error("Failed to analyze data")
    }
}

export async function analysisDasboard() {
    unstable_noStore()
    try {
        if (monthlyAnalysisCache.isEmpty()) {
            await fetchMonthlyData(0, 50)
        }

        return calc_Count_Amt(monthlyAnalysisCache.getData())
    } catch (error) {
        console.error("Error in analysisData:", error)
        throw new Error("Failed to analyze data")
    }
}

export async function categoryData(key: keyof typeof categorySizeMap) {
    try {
        if (monthlyAnalysisCache.isEmpty()) {
            await fetchMonthlyData(0, 50)
        }

        return orderCategory(monthlyAnalysisCache.getData(), key)
    } catch (error) {
        console.error("Error in analysisData:", error)
        throw new Error("Failed to analyze data")
    }
}

/**************Invoice Data (Price Checklist)**************/
export async function fetchInvoiceData(startIndex: number, stopIndex: number): Promise<PaginatedResponse<InvoiceData>> {
    unstable_noStore()

    try {
        if (invoiceCache.isEmpty()) {
            const path = (await exportInvoices()).filePath
            if (path) {
                const result = await fetchCSV<InvoiceData>(path)
                invoiceCache.setData(result, Object.keys(result[0]))
            }
        }

        const rows = invoiceCache.slice(startIndex, stopIndex)

        return {
            columns: invoiceCache.getColumns(),
            rows,
            hasMore: stopIndex < invoiceCache.length(),
            totalItems: invoiceCache.length(),
        }
    } catch (error) {
        console.error("Error in fetchInvoiceData:", error)
        throw new Error("Failed to fetchInvoiceData")
    }
}

export async function priceCheckListData(type: string) {
    try {
        if (invoiceCache.isEmpty()) {
            await fetchInvoiceData(0, 50)
        }

        const rawData = invoiceCache.getData()
        const data = transformInvoiceData(rawData)

        switch (type) {
            case "overview":
                return data

            case "analysis":
                return invoiceGradeAnalysis(data)

            case "stop":
                return data.filter(({ Status }) => Status?.toUpperCase() === "STOP")

            case "under300":
                return data.filter(({ "Invoice Total": total }) => safeNumber(total) < 300)
            case "check":
                return data.filter(({ "Invoice Total": total }) => safeNumber(total) < 300)

            default:
                throw new Error("Invalid request type")
        }
    } catch (error) {
        console.error(error)
        throw new Error("Failed to analyze data")
    }
}

/**************Category and Poral**************/
export const categoryPoralData = cache(async (type: string) => {
    if (invoiceCache.isEmpty()) {
        await fetchInvoiceData(0, 50)
    }

    const rawData = invoiceCache.getData()
    const transformedData = transformInvoiceData(rawData)
    invoiceAnalysisCache.setData(transformedData)

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
    }

    // Get today's date
    const today = new Date()
    const todayString = formatDate(today)

    // Get yesterday's date
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = formatDate(yesterday)

    const yesterdayData = transformedData.filter((item) => item["Invoice Created Date"].startsWith(yesterdayString))
    const todayData = transformedData.filter((item) => item["Invoice Created Date"].startsWith(todayString))

    if (type === "overview") return transformedData
    if (type === "yesterday") return yesterdayData
    if (type === "today") return todayData
    if (type === "poral") return calculatePoralMetrics(yesterdayData, todayData)
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
            productName,
            quantity,
            monthAvg: roundToDecimals(safeNumber((quantity / daysInCurrentMonth) * 100)).toString(),
        }))

        result.sort((a, b) => a.productName.localeCompare(b.productName))

        return result
    } catch {
        return null
    }
}

export const calculatePoralMonthlyReport = async (formData: FormData) => {
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
            productName,
            quantity,
            monthAvg: roundToDecimals(safeNumber((quantity / daysInCurrentMonth) * 100)).toString(),
        }))

        result.sort((a, b) => a.productName.localeCompare(b.productName))

        return result
    } catch {
        return null
    }
}