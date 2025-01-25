import { InputItem, OrderSummaryItem, MonthDataItem, SalesDataItem, SalesGridSummary } from "@/types/order"
import { calcMonthGrade, calcStaticGrade, compareGrades, getSupportData, MonthGradeTypes, MULTIPLE_SELLING_PRICE } from "./helper"
import { categorySizeMap } from "@/components/categories/data-table-filters"
import { roundToDecimals, safeNumber } from "./utils"

const CATEGORY_MAPPING: Record<string, string> = {
    "LEATHER WOMEN CASUAL BELT": "LEATHER WOMEN CASUAL BELT",
    "LEATHER KID SHOES": "LEATHER KID SHOES",
    "LEATHER WOMEN SHOES": "LEATHER WOMEN SHOES"
}

const DOH_THRESHOLDS = {
    OVERSTOCK: 180,
    UNDERSTOCK: 30
} as const

// Main transformation functions
export function transformData(
    INPUT: InputItem[],
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

    return INPUT.map(item => {
        const supportData = getSupportData(item["Sub Category"], item.Size)
        const sumSalesQty = getSumOfSales(item["Parent SKU"], 'qty')
        const sumSalesAmount = getSumOfSales(item["Parent SKU"], 'amount')
        const monthlyGrade = calcMonthGrade(safeNumber(item["Sale Qty"]))
        const staticGrade = calcStaticGrade(item["Static Grade"] as MonthGradeTypes)

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
            "Static Grade": item["Static Grade"] ?? "",
            "Month Grade_N": monthlyGrade.rank,
            "Comment": item["Month Grade"]
                ? compareGrades(item["Month Grade"], item["Static Grade"])
                : "",
            "Avg Selling Price": roundToDecimals(avgSellingPrice),
            "Multiple Price": vendorPrice ? roundToDecimals(avgSellingPrice / vendorPrice) : 0
        }
    })
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

export function calc_Count_Amt(data: MonthDataItem[]) {
    return {
        graphs: {
            bar: calcSalesGrid(data).rows
        },
        cards: data.reduce(
            (summary, item) => {
                const value = roundToDecimals(safeNumber(item["Total Amount"]));

                // Over Stock
                if (item.DOH > DOH_THRESHOLDS.OVERSTOCK) {
                    summary["Over Stock"].count++;
                    summary["Over Stock"].totalValue += value;
                }

                // Under Stock
                if (item.DOH < DOH_THRESHOLDS.UNDERSTOCK) {
                    summary['Under Stock'].count++;
                    summary['Under Stock'].totalValue += value;
                }

                // Under Price 2
                if (item['Multiple Price'] < MULTIPLE_SELLING_PRICE) {
                    summary['Under Price 2'].count++;
                    summary['Under Price 2'].totalValue += value;
                }

                // New Grade
                if (item["Static Grade"].toLowerCase() === 'new') {
                    summary['New Grade'].count++;
                    summary['New Grade'].totalValue += value;
                }

                // Common Order Summary
                summary['Common Order Summary'].count += safeNumber(item["Order Qty"]);
                summary['Common Order Summary'].totalValue += roundToDecimals(calcCommonOrderTotalValue(item['Order Qty'], item['Vendor Price']));

                // Order Summary Sheet
                summary['Order Summary Sheet'].count += safeNumber(item["Sale Qty"]);
                summary['Order Summary Sheet'].totalValue += roundToDecimals(safeNumber(item["Total Amount"]))

                return summary;
            },
            {
                'Over Stock': { count: 0, totalValue: 0 },
                'Under Stock': { count: 0, totalValue: 0 },
                'Under Price 2': { count: 0, totalValue: 0 },
                'New Grade': { count: 0, totalValue: 0 },
                'Common Order Summary': { count: 0, totalValue: 0 },
                'Order Summary Sheet': { count: 0, totalValue: 0 },
            }
        )
    };
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

export function orderCategory(analysisData: MonthDataItem[], key: keyof typeof categorySizeMap) {

    const categoryDisplay = {
        "mensshoes": ["PU MEN SHOES", "LEATHER MEN SHOES"],
        "womenshoes": ["LEATHER WOMEN SHOES", "PU WOMEN SHOES"],
        "kidsshoes": ["LEATHER KID SHOES"],
        "leatherjackets": ["LEATHER JACKETS"],
        "leathermencasualbelt": ["LEATHER MEN CASUAL BELT"],
        "othercategory": ["PU MEN SHOES", "LEATHER MEN SHOES", "LEATHER WOMEN SHOES", "PU WOMEN SHOES", "LEATHER KID SHOES", "LEATHER JACKETS", "LEATHER MEN CASUAL BELT"],
    }

    const categoryConfig = new Map(Object.entries(categoryDisplay));
    const currentCategory = categoryConfig.get(key);

    const skuMap = new Map<string, {
        sku: string,
        category: string,
        subCategory: string,
        salesSizes: Record<string, number>,
        totalSaleQty: number,
        totalSaleAmount: number,
        avgSellingPrice: number,
        monthGrade?: string,
        staticGrade?: string,
        orderQty: number,
        sets: number,
        availableInventorySize: Record<string, number>,
        availableInventorySizeTotal: number,
        openPurchaseSize: Record<string, number>,
        openPurchaseSizeTotal: number,
        orderQtySize: Record<string, number>,
        orderQtySizeTotal: number,
        saleThrough: number,
        vendorPrice: number,
        vendorName: string,
        totalPrice: number,
    }>();

    const isOtherCategory = key === "othercategory";

    analysisData.forEach(item => {
        const size = item.Size;
        const subCategory = item['Sub Category'];
        const category = item['Category Name']

        const isMatchingCriteria = isOtherCategory ? !currentCategory?.includes(subCategory) && !currentCategory?.includes(category) : ['leatherjackets', 'kidsshoes'].includes(key) ? currentCategory?.includes(category) : currentCategory?.includes(subCategory)

        if (!isMatchingCriteria || !categorySizeMap[key].includes(size)) {
            return;
        }

        const sku = item["Parent SKU"];
        let skuData = skuMap.get(sku);

        if (!skuData) {
            skuData = {
                sku,
                category,
                subCategory,
                salesSizes: {},
                totalSaleQty: 0,
                totalSaleAmount: 0,
                avgSellingPrice: 0,
                orderQty: 0,
                sets: 0,
                availableInventorySize: {},
                availableInventorySizeTotal: 0,
                openPurchaseSize: {},
                openPurchaseSizeTotal: 0,
                orderQtySize: {},
                orderQtySizeTotal: 0,
                saleThrough: 0,
                vendorPrice: 0,
                vendorName: "",
                totalPrice: 0,
            };
            skuMap.set(sku, skuData);
        }

        const saleQty = safeNumber(item["Sale Qty"]);
        const saleAmount = safeNumber(item["Sale Amount"]);
        const availableInventory = safeNumber(item["Available Inventory"]);
        const openPurchase = safeNumber(item['Open Purchase']);
        const orderQty = safeNumber(item['Order Qty']);
        const vendorPrice = safeNumber(item['Vendor Price']);

        // Sales data
        skuData.salesSizes[size] = (skuData.salesSizes[size] || 0) + saleQty;
        skuData.totalSaleQty += saleQty;
        skuData.totalSaleAmount += saleAmount;

        // Inventory data
        skuData.availableInventorySize[size] = (skuData.availableInventorySize[size] || 0) + availableInventory;
        skuData.availableInventorySizeTotal += availableInventory;

        // Purchase data
        skuData.openPurchaseSize[size] = (skuData.openPurchaseSize[size] || 0) + openPurchase;
        skuData.openPurchaseSizeTotal += openPurchase;

        // Order data
        skuData.orderQtySize[size] = (skuData.orderQtySize[size] || 0) + orderQty;
        skuData.orderQtySizeTotal += orderQty;

        // Calculate derived values
        skuData.avgSellingPrice = skuData.totalSaleQty ? (skuData.totalSaleAmount / skuData.totalSaleQty) : 0;
        skuData.monthGrade = calcMonthGrade(skuData.totalSaleQty).grade;
        skuData.staticGrade = item["Static Grade"];
        skuData.orderQty = saleQty * 2;
        skuData.sets = safeNumber(getSupportData(subCategory, size)?.["Ratio Sum"] || 0);
        skuData.saleThrough = safeNumber((skuData.totalSaleQty / (skuData.totalSaleQty + skuData.availableInventorySizeTotal)) * 100);
        skuData.vendorPrice = vendorPrice;
        skuData.vendorName = item['Vendor Name'];
        skuData.totalPrice = skuData.vendorPrice * skuData.orderQtySizeTotal;
    });

    const result = Array.from(skuMap.values());
    console.log(result[0], "result")

    return result;
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
        totalValue: calcCommonOrderTotalValue(order['Order Qty'], order['Vendor Price'])
    }))
}

function calcCommonOrderTotalValue(orderQty: string, vendorPrice: string) {
    return roundToDecimals(
        safeNumber(orderQty) * safeNumber(vendorPrice)
    )
}