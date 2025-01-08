'use server'

// @aloksharma10
// TODO: Need to fix all the type of the data 

import { revalidatePath } from 'next/cache'
import { parse } from 'csv-parse/sync'
import { analysis, processSalesData, transformData } from '@/lib/action-utils'
import { SUPPORT, UTILS } from '@/lib/helper'

export type OrderItem = {
    id: string
    'Sale Order Item Code': string
    'Display Order Code': string
    Category: string
    'Item Type Name': string
    'Total Price': string
    'Sale Order Status': string
    'Shipping Package Status Code': string
}

const CHUNK_SIZE = 1000;

const SALES_ORDER_URL = "https://teakwoodindia.unicommerce.com/open/redirection/export/aHR0cHM6Ly91bmljb21tZXJjZS1leHBvcnQtaW4uczMuYW1hem9uYXdzLmNvbS90ZWFrd29vZGluZGlhLzY3N2E1ODJhN2JkNjUxNmMwMTM2ZDBlNC9FeHBvcnQtU2FsZSUyME9yZGVycy10ZWFrd29vZGluZGlhXzA1MDEyMDI1MTUzMDMzLmNzdiMjIzY3N2E1ODJhN2JkNjUxNmMwMTM2ZDBlNCMjIzA1XzAxXzIwMjU="

const MONTHLY_ORDER_URL = "https://teakwoodindia.unicommerce.com/open/redirection/export/aHR0cHM6Ly91bmljb21tZXJjZS1leHBvcnQtaW4uczMuYW1hem9uYXdzLmNvbS90ZWFrd29vZGluZGlhLzY3N2E3NzRmMmI5MDdjMjFjY2Y2ZjNkZS9FeHBvcnQtTW9udGhseSUyME9yZGVyJTIwUmVwb3J0LXRlYWt3b29kaW5kaWFfMDUwMTIwMjUxNzQ0MDcuY3N2IyMjNjc3YTc3NGYyYjkwN2MyMWNjZjZmM2RlIyMjMDVfMDFfMjAyNQ=="

let SALES_API_DATA: any[] = []
let SALES_COLUMNS: string[] = []

let MONTHLY_API_DATA: any[] = []
let MONTHLY_ANALYSIS_DATA: any[] = []

async function fetchCSV(url: string): Promise<void> {
    try {
        const response = await fetch(url, {
            cache: "no-store",
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const csvText = await response.text()
        const records = parse(csvText, {
            columns: true,
            skip_empty_lines: true
        })

        return records;
    } catch (error) {
        console.error('Error fetching or parsing the CSV:', error)
        throw error
    }
}

export async function fetchSalesData(startIndex: number, stopIndex: number): Promise<{
    columns: string[]
    rows: OrderItem[]
    hasMore: boolean
    totalItems: number
}> {
    if (SALES_API_DATA.length === 0) {
        const result = await fetchCSV(SALES_ORDER_URL)
        SALES_API_DATA = result
        SALES_COLUMNS = Object.keys(result[0])
    }

    const rows = SALES_API_DATA.slice(startIndex, stopIndex)

    revalidatePath('/')

    return {
        columns: SALES_COLUMNS,
        rows: rows,
        hasMore: stopIndex < SALES_API_DATA.length,
        totalItems: SALES_API_DATA.length
    }
}

export async function fetchMonthlyData(startIndex: number, stopIndex: number): Promise<{
    columns: string[]
    rows: any[]
    hasMore: boolean
    totalItems: number
}> {
    const processChunk = (chunk: any[]) => {
        return chunk.map(item => {
            const sales_sku_data = salesDataMap.get(item["Sku Code"]);

            item["Sale Qty"] = sales_sku_data?.countOfItemSKUCode || 0;
            item["Sale Amount"] = sales_sku_data?.sumOfSellingPrice || 0;
            return item;
        });
    };

    if (MONTHLY_API_DATA.length === 0) {
        const result = await fetchCSV(MONTHLY_ORDER_URL)
        MONTHLY_API_DATA = result
        // MONTHLY_COLUMNS = Object.keys(result[0])
    }


    if (SALES_API_DATA.length === 0) {
        const result = await fetchCSV(SALES_ORDER_URL)
        SALES_API_DATA = result
        SALES_COLUMNS = Object.keys(result[0])
    }


    const salesDataMap = processSalesData(SALES_API_DATA)

    const INPUT = [];
    for (let i = 0; i < MONTHLY_API_DATA.length; i += CHUNK_SIZE) {
        const chunk = MONTHLY_API_DATA.slice(i, i + CHUNK_SIZE);
        INPUT.push(...processChunk(chunk));
    }

    MONTHLY_ANALYSIS_DATA = transformData(INPUT, SUPPORT, UTILS);

    revalidatePath('/')

    return {
        columns: Object.keys(MONTHLY_ANALYSIS_DATA[0]),
        rows: MONTHLY_ANALYSIS_DATA,
        hasMore: stopIndex < MONTHLY_API_DATA.length,
        totalItems: MONTHLY_API_DATA.length
    }
}

export async function analysisData(key) {
    if (MONTHLY_ANALYSIS_DATA.length < 1) {
        await fetchMonthlyData(0, 50)
    }

   const data = await analysis(MONTHLY_ANALYSIS_DATA, key)
   return data
}
