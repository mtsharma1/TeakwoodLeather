'use server'

import { revalidatePath, unstable_noStore } from 'next/cache'
import { parse } from 'csv-parse/sync'
import { analysis, calc_Count_Amt, orderCategory, transformData } from '@/lib/action-utils'
import { InvoiceData, MonthDataItem, SalesDataItem } from '@/types/order'
import { categorySizeMap } from '@/components/categories/data-table-filters'
import { transformInvoiceData } from '@/lib/invoice-action-utils'

// Constants
const CACHE_REVALIDATION_PATH = '/analysis'

// URLs should be in environment variables
// const SALES_ORDER_URL = "https://teakwoodindia.unicommerce.com/open/redirection/export/aHR0cHM6Ly91bmljb21tZXJjZS1leHBvcnQtaW4uczMuYW1hem9uYXdzLmNvbS90ZWFrd29vZGluZGlhLzY3ODRkNGYzNjZlNWJkMWE4ODMyZmZlZS9FeHBvcnQtU2FsZSUyME9yZGVycy10ZWFrd29vZGluZGlhXzEzMDEyMDI1MTQyNTMyLmNzdiMjIzY3ODRkNGYzNjZlNWJkMWE4ODMyZmZlZSMjIzEzXzAxXzIwMjU="

const INVOICE_URL = "https://teakwoodindia.unicommerce.com/open/redirection/export/aHR0cHM6Ly91bmljb21tZXJjZS1leHBvcnQtaW4uczMuYW1hem9uYXdzLmNvbS90ZWFrd29vZGluZGlhLzY3OWE4NWRlZGM4NGUzMjk0MmZhYThiNC9FeHBvcnQtSW52b2ljZS10ZWFrd29vZGluZGlhXzMwMDEyMDI1MDExNzQzLmNzdiMjIzY3OWE4NWRlZGM4NGUzMjk0MmZhYThiNCMjIzMwXzAxXzIwMjU="

const MONTHLY_ORDER_URL = "https://teakwoodindia.unicommerce.com/open/redirection/export/aHR0cHM6Ly91bmljb21tZXJjZS1leHBvcnQtaW4uczMuYW1hem9uYXdzLmNvbS90ZWFrd29vZGluZGlhLzY3OWE4NWQ0OWJiYTY1MmJiYTRkNTZhMS9FeHBvcnQtTW9udGhseSUyME9yZGVyJTIwUmVwb3J0LXRlYWt3b29kaW5kaWFfMzAwMTIwMjUwMTE4NDEuY3N2IyMjNjc5YTg1ZDQ5YmJhNjUyYmJhNGQ1NmExIyMjMzBfMDFfMjAyNQ=="

interface PaginatedResponse<T> {
    columns: string[]
    rows: T[]
    hasMore: boolean
    totalItems: number
}

// Cache management
class DataCache<T> {
    private data: T[] = []
    private columns: string[] = []

    isEmpty(): boolean {
        return this.data.length === 0
    }

    setData(data: T[], columns?: string[]) {
        this.data = data
        if (columns) this.columns = columns
    }

    getData(): T[] {
        return this.data
    }

    getColumns(): string[] {
        return this.columns
    }

    slice(start: number, end: number): T[] {
        return this.data.slice(start, end)
    }

    length(): number {
        return this.data.length
    }
}

// Initialize caches
const invoiceCache = new DataCache<InvoiceData>()
const salesCache = new DataCache<SalesDataItem>()
const monthlyCache = new DataCache<MonthDataItem>()
const monthlyAnalysisCache = new DataCache<MonthDataItem>()

// Utility functions
async function fetchCSV<T>(url: string): Promise<T[]> {
    const response = await fetch(url, {
        // cache: process.env.NODE_ENV === 'production' ? 'force-cache' : 'no-store',
        headers: {
            'Content-Type': 'text/csv',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    // Process the CSV data in memory instead of caching
    return processCSVData(csvText);
}

function processCSVData<T>(csvText: string): T[] {
    return parse(csvText, {
        columns: true,
        skip_empty_lines: true
    }) as T[]
}

export async function fetchSalesData(
    startIndex: number,
    stopIndex: number
): Promise<PaginatedResponse<SalesDataItem>> {
    try {
        if (salesCache.isEmpty()) {
            const result = await fetchCSV<SalesDataItem>(INVOICE_URL)
            salesCache.setData(result, Object.keys(result[0]))
        }

        const rows = salesCache.slice(startIndex, stopIndex)
        revalidatePath(CACHE_REVALIDATION_PATH)

        return {
            columns: salesCache.getColumns(),
            rows,
            hasMore: stopIndex < salesCache.length(),
            totalItems: salesCache.length()
        }
    } catch (error) {
        console.error('Error in fetchSalesData:', error)
        throw new Error('Failed to fetch sales data')
    }
}

export async function fetchMonthlyData(
    startIndex: number,
    stopIndex: number
): Promise<PaginatedResponse<MonthDataItem>> {
    // Disable static rendering
    unstable_noStore()

    try {
        if (monthlyCache.isEmpty()) {
            const result = await fetchCSV<MonthDataItem>(MONTHLY_ORDER_URL)
            monthlyCache.setData(result)
        }

        const transformedData = transformData(monthlyCache.getData())
        monthlyAnalysisCache.setData(transformedData)

        return {
            columns: Object.keys(monthlyAnalysisCache.getData()[0]),
            rows: monthlyAnalysisCache.slice(startIndex, stopIndex),
            hasMore: stopIndex < monthlyAnalysisCache.length(),
            totalItems: monthlyAnalysisCache.length()
        }
    } catch (error) {
        console.error('Error in fetchMonthlyData:', error)
        throw new Error('Failed to fetch monthly data')
    }
}

export async function analysisData(key: string) {
    try {
        if (monthlyAnalysisCache.isEmpty()) {
            await fetchMonthlyData(0, 50)
        }

        return analysis(monthlyAnalysisCache.getData(), key)
    } catch (error) {
        console.error('Error in analysisData:', error)
        throw new Error('Failed to analyze data')
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
        console.error('Error in analysisData:', error)
        throw new Error('Failed to analyze data')
    }
}

export async function categoryData(key: keyof typeof categorySizeMap) {
    try {
        if (monthlyAnalysisCache.isEmpty()) {
            await fetchMonthlyData(0, 50)
        }

        return orderCategory(monthlyAnalysisCache.getData(), key)
    } catch (error) {
        console.error('Error in analysisData:', error)
        throw new Error('Failed to analyze data')
    }
}


/**************Invoice Data**************/
export async function fetchInvoiceData(
    startIndex: number,
    stopIndex: number
): Promise<PaginatedResponse<InvoiceData>> {
    try {
        if (invoiceCache.isEmpty()) {
            const result = await fetchCSV<InvoiceData>(INVOICE_URL)
            invoiceCache.setData(result, Object.keys(result[0]))
        }

        const rows = invoiceCache.slice(startIndex, stopIndex)

        return {
            columns: invoiceCache.getColumns(),
            rows,
            hasMore: stopIndex < invoiceCache.length(),
            totalItems: invoiceCache.length()
        }
    } catch (error) {
        console.error('Error in fetchInvoiceData:', error)
        throw new Error('Failed to fetchInvoiceData')
    }
}

export async function priceCheckListData() {
    try {
        if (invoiceCache.isEmpty()) {
            await fetchInvoiceData(0, 50)
        }
        return transformInvoiceData(invoiceCache.getData())
    } catch (error) {
        console.error('Error in analysisData:', error)
        throw new Error('Failed to analyze data')
    }
}
