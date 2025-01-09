import { GradeResult, InputItem, OrderSummaryItem, MonthDataItem, SalesDataItem, SalesGridSummary, SupportItem, Utils } from "@/types/order"
import { MULTIPLE_SELLING_PRICE } from "./helper"

// Constants
const GRADE_THRESHOLDS = {
    A: 30,
    B: 10
} as const

const CATEGORY_MAPPING: Record<string, string> = {
    "LEATHER WOMEN CASUAL BELT": "LEATHER WOMEN CASUAL BELT",
    "LEATHER KID SHOES": "LEATHER KID SHOES",
    "LEATHER WOMEN SHOES": "LEATHER WOMEN SHOES"
}

const DOH_THRESHOLDS = {
    OVERSTOCK: 180,
    UNDERSTOCK: 30
} as const

// Utility functions
const safeNumber = (value: string | number): number => 
    typeof value === 'string' ? Number(value) || 0 : value || 0

const roundToDecimals = (value: number, decimals: number = 2): number => 
    Number(value.toFixed(decimals))

// Main transformation functions
export function transformData(
    INPUT: InputItem[],
    SUPPORT: SupportItem[],
    UTILS: Utils
): MonthDataItem[] {
    // Memoization for performance optimization
    const salesQtyCache = new Map<string, number>()
    const salesAmountCache = new Map<string, number>()

    const getSumOfSales = (parentSkuCode: string, type: 'qty' | 'amount'): number => {
        const cache = type === 'qty' ? salesQtyCache : salesAmountCache
        
        if (!cache.has(parentSkuCode)) {
            const sum = INPUT.reduce((acc, item) => {
                if (item["Parent SKU"] === parentSkuCode) {
                    return acc + safeNumber(type === 'qty' ? item["Sale Qty"] : item["Sale Amount"])
                }
                return acc
            }, 0)
            cache.set(parentSkuCode, sum)
        }
        
        return cache.get(parentSkuCode)!
    }

    const getSupportData = (subCategory: string, size: string): SupportItem | undefined => {
        const lookupKey = `${subCategory}_${size}`
        return SUPPORT.find(item => {
            const supportKey = item["Sub Category New"] || item["Sub Category"]
            return supportKey === lookupKey || supportKey === subCategory
        })
    }

    const calcGrade = (saleQty: number): string => {
        if (saleQty > GRADE_THRESHOLDS.A) return "A"
        if (saleQty >= GRADE_THRESHOLDS.B) return "B"
        return "C"
    }

    const calcMonthGrade = (saleQty: number): GradeResult => {
        const grade = calcGrade(saleQty)
        return { grade, rank: UTILS.monthGrade[grade] }
    }

    const calcStaticGrade = (grade: string): GradeResult => ({
        rank: UTILS.monthGrade[grade]
    })

    return INPUT.map(item => {
        const supportData = getSupportData(item["Sub Category"], item.Size)
        const sumSalesQty = getSumOfSales(item["Parent SKU"], 'qty')
        const sumSalesAmount = getSumOfSales(item["Parent SKU"], 'amount')
        const monthlyGrade = calcMonthGrade(safeNumber(item["Sale Qty"]))
        const staticGrade = calcStaticGrade(item["Static Grade"])

        const availableInventory = safeNumber(item["Available Inventory"])
        const openPurchase = safeNumber(item["Open Purchase"])
        const saleQty = safeNumber(item["Sale Qty"])
        const daysPositive = safeNumber(item["Days of positive inventory"])
        const vendorPrice = safeNumber(item["Vendor Price"])

        const requiredQty = (saleQty * 2) - (availableInventory + openPurchase)
        
        const orderQty = supportData 
            ? Math.max(0, Math.ceil(
                ((sumSalesQty * 2) / (Number(supportData["Ratio Sum"]) || 1)) *
                safeNumber(supportData["Ratio"]) -
                (availableInventory + openPurchase)
            )) 
            : 0

        const saleThrough = roundToDecimals((saleQty / (availableInventory + saleQty)) * 100)
        const totalAmount = vendorPrice * orderQty
        const roh = daysPositive ? (saleQty / daysPositive) : 0
        const doh = roh ? (availableInventory / roh) : 0
        const avgSellingPrice = sumSalesQty ? (sumSalesAmount / sumSalesQty) : 0

        return {
            ...item,
            "Category Name": CATEGORY_MAPPING[item["Sub Category"]] ?? item["Category Name"],
            "Required Qty": requiredQty.toString(),
            "Order Qty": orderQty.toString(),
            "Sale Through": saleThrough.toString(),
            "Total Amount": totalAmount.toString(),
            "ROH": roundToDecimals(roh),
            "DOH": roundToDecimals(doh),
            "New SKU Code": `${item["Sku Code"]}_${item.Size}`,
            "Static Grade_N": staticGrade.rank,
            "Month Grade": monthlyGrade.grade ?? "",
            "Month Grade_N": monthlyGrade.rank,
            "Comment": item["Month Grade"] 
                ? compareGrades(item["Month Grade"], item["Static Grade"]) 
                : "",
            "Avg Selling Price": roundToDecimals(avgSellingPrice),
            "Multiple Price": vendorPrice ? roundToDecimals(avgSellingPrice / vendorPrice) : 0
        }
    })
}

// Helper function for grade comparison
const compareGrades = (monthGrade: string, staticGrade: string): string => {
    const monthNum = Number(monthGrade)
    const staticNum = Number(staticGrade)
    if (monthNum > staticNum) return "Degrade"
    if (monthNum < staticNum) return "Upgrade"
    return "No Change"
}

export function processSalesData(data: SalesDataItem[]): Map<string, { 
    rowLabel: string
    countOfItemSKUCode: number
    sumOfSellingPrice: number 
}> {
    return data.reduce((acc, row) => {
        const sku = row['Item SKU Code']?.trim()
        const price = safeNumber(row['Selling Price'])
        
        if (row['Sale Order Status'] === 'COMPLETE' && sku) {
            if (!acc.has(sku)) {
                acc.set(sku, {
                    rowLabel: sku,
                    countOfItemSKUCode: 0,
                    sumOfSellingPrice: 0
                })
            }

            const skuInfo = acc.get(sku)!
            skuInfo.countOfItemSKUCode++
            skuInfo.sumOfSellingPrice += price
        }
        
        return acc
    }, new Map())
}

export function analysis(analysisData: MonthDataItem[], key?: string) {
    const filters = {
        overstock: (item: MonthDataItem) => item.DOH > DOH_THRESHOLDS.OVERSTOCK,
        understock: (item: MonthDataItem) => item.DOH < DOH_THRESHOLDS.UNDERSTOCK,
        underprice2: (item: MonthDataItem) => item['Multiple Price'] < MULTIPLE_SELLING_PRICE
    }

    if (key && key in filters) {
        return analysisData.filter(filters[key as keyof typeof filters])
    }

    if (key === 'salesinventorsSummary') return calcSalesGrid(analysisData)
    if (key === 'ordersummary') return calcOrderSummary(analysisData)
    if (key === 'commonordersummary') return commonOrderSummary(analysisData)

    return {
        overStock: analysisData.filter(filters.overstock),
        underStock: analysisData.filter(filters.understock),
        underPrice2: analysisData.filter(filters.underprice2),
        salesInventorySummary: calcSalesGrid(analysisData),
        orderSummary: calcOrderSummary(analysisData)
    }
}

// Analysis helper functions
function calcSalesGrid(analysisData: MonthDataItem[]) {
    const grades = ['A', 'B', 'C', 'D', 'A+', 'NEW'] as const
    const initialGradeSummary = Object.fromEntries(
        grades.map(grade => [grade, {
            saleValue: 0,
            salePercentage: 0,
            inventoryValue: 0,
            inventoryPercentage: 0
        }])
    ) as Record<typeof grades[number], SalesGridSummary>

    const summary = analysisData.reduce((acc, item) => {
        const saleAmount = safeNumber(item['Sale Amount'])
        const inventoryAmount = safeNumber(item['Available Inventory'])
        const grade = (item['Static Grade'] || 'NEW') as keyof typeof initialGradeSummary

        acc.total += saleAmount
        acc.totalInventory += inventoryAmount

        if (grade in acc.gradeWiseSales) {
            acc.gradeWiseSales[grade].saleValue += saleAmount
            acc.gradeWiseSales[grade].inventoryValue += inventoryAmount
        }

        return acc
    }, {
        total: 0,
        totalInventory: 0,
        gradeWiseSales: initialGradeSummary
    })

    // Calculate percentages and round values
    Object.values(summary.gradeWiseSales).forEach(grade => {
        if (summary.total > 0) {
            grade.salePercentage = roundToDecimals((grade.saleValue / summary.total) * 100)
        }
        if (summary.totalInventory > 0) {
            grade.inventoryPercentage = roundToDecimals((grade.inventoryValue / summary.totalInventory) * 100)
        }
        grade.saleValue = roundToDecimals(grade.saleValue)
        grade.inventoryValue = roundToDecimals(grade.inventoryValue)
    })

    return {
        totalSale: roundToDecimals(summary.total),
        totalInventory: roundToDecimals(summary.totalInventory),
        rows: Object.entries(summary.gradeWiseSales).map(([grade, data]) => ({
            grade,
            ...data
        })),
        cols: ['grade', 'saleValue', 'salePercentage', 'inventoryValue', 'inventoryPercentage']
    }
}

function calcOrderSummary(analysisData: MonthDataItem[]) {
    const summary = analysisData.reduce((acc, item) => {
        const label = item["Category Name"]
        if (!acc[label]) {
            acc[label] = {
                totalSaleValue: 0,
                totalQuantity: 0,
                totalOrderValue: 0
            }
        }

        const entry = acc[label]
        entry.totalSaleValue += safeNumber(item["Sale Amount"])
        entry.totalQuantity += safeNumber(item["Sale Qty"])
        entry.totalOrderValue += safeNumber(item["Total Amount"])
        
        return acc
    }, {} as Record<string, OrderSummaryItem>)

    return {
        rows: Object.entries(summary).map(([category, data]) => ({
            category,
            totalSaleValue: roundToDecimals(data.totalSaleValue),
            totalQuantity: roundToDecimals(data.totalQuantity),
            totalOrderValue: roundToDecimals(data.totalOrderValue)
        })),
        cols: ['category', 'totalSaleValue', 'totalQuantity', 'totalOrderValue']
    }
}

function commonOrderSummary(analysisData: MonthDataItem[]) {
    return analysisData.map(order => ({
        item: order['Sku Code'],
        category: order['Category Name'],
        subCategory: order['Sub Category'],
        orderQty: order['Order Qty'],
        vendorName: order['Vendor Name'],
        vendorPrice: order['Vendor Price'],
        totalValue: roundToDecimals(
            safeNumber(order['Order Qty']) * safeNumber(order['Vendor Price'])
        )
    }))
}