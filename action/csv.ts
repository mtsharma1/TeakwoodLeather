'use server'

import { revalidatePath } from 'next/cache'
import { parse } from 'csv-parse/sync'
import { analysis, orderCategory, transformData } from '@/lib/action-utils'
import { MonthDataItem, SalesDataItem } from '@/types/order'
import { categorySizeMap } from '@/components/categories/data-table-filters'

// Constants
const CHUNK_SIZE = 1000
const CACHE_REVALIDATION_PATH = '/'

// URLs should be in environment variables
const SALES_ORDER_URL = "https://teakwoodindia.unicommerce.com/open/redirection/export/aHR0cHM6Ly91bmljb21tZXJjZS1leHBvcnQtaW4uczMuYW1hem9uYXdzLmNvbS90ZWFrd29vZGluZGlhLzY3ODRkNGYzNjZlNWJkMWE4ODMyZmZlZS9FeHBvcnQtU2FsZSUyME9yZGVycy10ZWFrd29vZGluZGlhXzEzMDEyMDI1MTQyNTMyLmNzdiMjIzY3ODRkNGYzNjZlNWJkMWE4ODMyZmZlZSMjIzEzXzAxXzIwMjU="

const MONTHLY_ORDER_URL = "https://teakwoodindia.unicommerce.com/open/redirection/export/aHR0cHM6Ly91bmljb21tZXJjZS1leHBvcnQtaW4uczMuYW1hem9uYXdzLmNvbS90ZWFrd29vZGluZGlhLzY3ODRkNDdiNjZlNWJkMWE4ODMyZmIxYS9FeHBvcnQtTW9udGhseSUyME9yZGVyJTIwUmVwb3J0LXRlYWt3b29kaW5kaWFfMTMwMTIwMjUxNDI0MjUuY3N2IyMjNjc4NGQ0N2I2NmU1YmQxYTg4MzJmYjFhIyMjMTNfMDFfMjAyNQ=="

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
const salesCache = new DataCache<SalesDataItem>()
const monthlyCache = new DataCache<MonthDataItem>()
const monthlyAnalysisCache = new DataCache<any>()

// Utility functions
async function fetchCSV<T>(url: string): Promise<T[]> {
    const response = await fetch(url, {
        cache: 'no-store',
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

// Server actions
export async function fetchSalesData(
    startIndex: number,
    stopIndex: number
): Promise<PaginatedResponse<SalesDataItem>> {
    try {
        if (salesCache.isEmpty()) {
            const result = await fetchCSV<SalesDataItem>(SALES_ORDER_URL)
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
    try {
        // Load data if needed
        if (monthlyCache.isEmpty()) {
            const result = await fetchCSV<MonthDataItem>(MONTHLY_ORDER_URL)
            monthlyCache.setData(result)
        }

        // if (salesCache.isEmpty()) {
        //     await fetchSalesData(0, 1) // This will populate salesCache
        // }

        // Process data if not already processed
        // if (monthlyAnalysisCache.isEmpty()) {
        //     const salesDataMap = processSalesData(salesCache.getData())

        //     // Process in chunks for better memory management
        //     const processedData: MonthDataItem[] = []
        //     for (let i = 0; i < monthlyCache.length(); i += CHUNK_SIZE) {
        //         const chunk = monthlyCache.slice(i, i + CHUNK_SIZE)
        //         const processedChunk = chunk.map(item => ({
        //             ...item,
        //             'Sale Qty': salesDataMap.get(item['Sku Code'])?.countOfItemSKUCode || 0,
        //             'Sale Amount': salesDataMap.get(item['Sku Code'])?.sumOfSellingPrice || 0
        //         }))
        //         processedData.push(...processedChunk)
        //     }

        //     const transformedData = transformData(processedData)
        //     monthlyAnalysisCache.setData(transformedData)
        // }

        console.log(monthlyCache.getData().length, "data")
        const transformedData = transformData(monthlyCache.getData())
        monthlyAnalysisCache.setData(transformedData)

        revalidatePath(CACHE_REVALIDATION_PATH)

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

