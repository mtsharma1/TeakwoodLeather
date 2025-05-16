import { InputItem, OrderSummaryItem, MonthDataItem, SalesDataItem } from "@/types/order"
import { calcMonthGrade, calcStaticGrade, compareGrades, excludeSubCategoryOrderSummary, excludeSubCategoryOverStock, excludeSubCategoryUnderStock, getSupportData, grades, MonthGradeTypes, MULTIPLE_SELLING_PRICE } from "./helper"
import { categorySizeMap } from "@/components/categories/data-table-filters"
import { roundToDecimals, safeNumber } from "./utils"
import prisma from "./prisma"

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


        const orderQty = parseInt((supportData
            ? Math.max(0,
                safeNumber(((sumSalesQty * 2) / (safeNumber(supportData["Ratio Sum"])) * safeNumber(supportData["Ratio"])) -
                    (availableInventory + openPurchase))
            ) : 0).toString())

        const saleThrough = roundToDecimals(safeNumber((saleQty / (availableInventory + saleQty))) * 100)
        const totalAmount = vendorPrice * orderQty
        const ros = daysPositive ? (saleQty / daysPositive) : 0
        const doh = ros ? (availableInventory / ros) : 0
        const avgSellingPrice = sumSalesQty ? (sumSalesAmount / sumSalesQty) : 0

        return {
            ...item,
            "Category Name": CATEGORY_MAPPING[item["Sub Category"]] ?? item["Category Name"],
            "Required Qty": requiredQty.toString(),
            "Order Qty": orderQty.toString(),
            "Sale Through": saleThrough.toString(),
            "Total Amount": totalAmount.toString(),
            "ROS": roundToDecimals(ros),
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
            "Multiple Price": vendorPrice ? safeNumber(avgSellingPrice / vendorPrice) : 0
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

const mergeSalesAndInventory = (
    sales: ReturnType<typeof calcSalesGrid>["rows"],
    inventory: ReturnType<typeof calcInventoryMIS>["rows"]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Object.values([...sales, ...inventory].reduce((acc: Record<string, any>, item) =>
    (acc[item.grade] = { ...acc[item.grade], ...item }, acc), {}));

export async function calc_Count_Amt(data: MonthDataItem[]) {
    return {
        graphs: {
            bar: mergeSalesAndInventory(calcSalesGrid(data).rows, calcInventoryMIS(data).rows)
        },
        cards: data.reduce(
            (summary, item) => {
                // const value = roundToDecimals(safeNumber(item["Total Amount"]));
                const vendorPrice = roundToDecimals(safeNumber(item["Vendor Price"]));
                const aIv = roundToDecimals(safeNumber(item["Available Inventory"]));

                // Over Stock
                if (item.DOH > DOH_THRESHOLDS.OVERSTOCK) {
                    summary["Over Stock"].count++;
                    summary["Over Stock"].totalValue += (vendorPrice * aIv);
                }

                // Under Stock
                if (item.DOH < DOH_THRESHOLDS.UNDERSTOCK && ['A', 'B'].includes(item["Static Grade"]) && !excludeSubCategoryUnderStock.includes(item['Sub Category'])) {
                    summary['Under Stock'].count++;
                    summary['Under Stock'].totalValue += (vendorPrice * aIv);
                }

                // Under Price 2
                // if (item['Multiple Price'] < MULTIPLE_SELLING_PRICE) {
                //     summary['Under Price 2'].count++;
                //     summary['Under Price 2'].totalValue += value;
                // }

                // // New Grade
                // if (item["Static Grade"].toLowerCase() === 'new') {
                //     summary['New Grade'].count++;
                //     summary['New Grade'].totalValue += value;
                // }

                // Common Order Summary
                // summary['Common Order Summary'].count += safeNumber(item["Order Qty"]);
                // summary['Common Order Summary'].totalValue += roundToDecimals(calcCommonOrderTotalValue(item['Order Qty'], item['Vendor Price']));

                // // Order Summary Sheet
                // summary['Order Summary Sheet'].count += safeNumber(item["Sale Qty"]);
                // summary['Order Summary Sheet'].totalValue += roundToDecimals(safeNumber(item["Total Amount"]))

                return summary;
            },
            {
                'Over Stock': { count: 0, totalValue: 0 },
                'Under Stock': { count: 0, totalValue: 0 },
                // 'Under Price 2': { count: 0, totalValue: 0 },
                // 'New Grade': { count: 0, totalValue: 0 },
                // 'Common Order Summary': { count: 0, totalValue: 0 },
                // 'Order Summary Sheet': { count: 0, totalValue: 0 },
            }
        ),
        unlink_sku_card: await prisma.channelItemReport.count({
            where: {
                status_code: 'UNLINKED'
            }
        })
    };
}

export function analysis(analysisData: MonthDataItem[], key?: string) {
    const filters = {
        overstock: (item: MonthDataItem) => item.DOH > DOH_THRESHOLDS.OVERSTOCK && !excludeSubCategoryOverStock.includes(item['Sub Category']),
        understock: (item: MonthDataItem) => item.DOH < DOH_THRESHOLDS.UNDERSTOCK && ['A', 'B'].includes(item["Static Grade"]) && !excludeSubCategoryUnderStock.includes(item['Sub Category']),
        underprice2: (item: MonthDataItem) => item['Multiple Price'] < MULTIPLE_SELLING_PRICE,
        newgrade: (item: MonthDataItem) => item['Static Grade'] === "NEW"
    }

    const sortBySaleQtyDesc = (a: MonthDataItem, b: MonthDataItem) => {
        const bSaleQty = safeNumber(b["Sale Qty"]);
        const aSaleQty = safeNumber(a["Sale Qty"]);
        return bSaleQty - aSaleQty;
    };

    if (key && key in filters) {
        return analysisData.filter(filters[key as keyof typeof filters]).sort(sortBySaleQtyDesc);
    }

    if (key === 'overview') return analysisData.sort(sortBySaleQtyDesc);
    if (key === 'salesSummary') return calcSalesGrid(analysisData);
    if (key === 'inventorymis') return calcInventoryMIS(analysisData);
    if (key === 'ordersummary') return calcOrderSummary(analysisData);
    if (key === 'commonordersummary') return commonOrderSummary(analysisData);

    return {
        overStock: analysisData.filter(filters.overstock).sort(sortBySaleQtyDesc),
        underStock: analysisData.filter(filters.understock).sort(sortBySaleQtyDesc),
        underPrice2: analysisData.filter(filters.underprice2).sort(sortBySaleQtyDesc),
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
        // "othercategory": ["PU MEN SHOES", "LEATHER MEN SHOES", "LEATHER WOMEN SHOES", "PU WOMEN SHOES", "LEATHER KID SHOES", "LEATHER JACKETS", "LEATHER MEN CASUAL BELT"],
        "othercategory": ["SHOES", "LEATHER WOMEN SHOES", 'LEATHER SHOES', 'PU SHOES', 'LEATHER MEN SHOES', 'KIDS SHOE', 'LEATHER JACKETS', 'LEATHER MEN CASUAL BELT', 'LEATHER BELTS', 'BUCKLE'],
    }

    const categoryConfig = new Map(Object.entries(categoryDisplay));
    const currentCategory = categoryConfig.get(key);

    const skuMap = new Map<string, {
        sku: string,
        category: string,
        ros: string,
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

        sku_: Record<string, string>,
    }>();

    const isOtherCategory = key === "othercategory";

    if (isOtherCategory && currentCategory) {
        return filterDataForOtherCategoryOnly(analysisData, currentCategory)
    }

    analysisData.forEach(item => {
        const size = item.Size;
        const subCategory = item['Sub Category'];
        const category = item['Category Name']

        const isMatchingCriteria = ['leatherjackets', 'kidsshoes'].includes(key) ? currentCategory?.includes(category) : currentCategory?.includes(subCategory)

        if (!isMatchingCriteria) {
            return;
        }

        const colHeaderToRemoveDup = isOtherCategory ? "Sku Code" : "Parent SKU"

        const sku = item[colHeaderToRemoveDup];
        let skuData = skuMap.get(sku);

        if (!skuData) {
            skuData = {
                sku,
                ros: "",
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

                sku_: {}
            };
            skuMap.set(sku, skuData);
        }

        const saleQty = safeNumber(item["Sale Qty"]);
        const saleAmount = safeNumber(item["Sale Amount"]);
        const availableInventory = safeNumber(item["Available Inventory"]);
        const openPurchase = safeNumber(item['Open Purchase']);
        const orderQty = safeNumber(item['Order Qty']);
        const vendorPrice = safeNumber(item['Vendor Price']);
        const ros = item.ROS;

        // ROS
        skuData.ros = roundToDecimals(ros).toString();

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

        // Extended for data (SKU Code + Size)
        skuData.sku_[size] = skuData.sku + size;

    });

    const result = Array.from(skuMap.values());

    return result;
}

function filterDataForOtherCategoryOnly(analysisData: MonthDataItem[], key: string[]) {
    return analysisData.filter(item => !key?.includes(item['Category Name']))
}

// Analysis helper functions
function calcSalesGrid(analysisData: MonthDataItem[]) {
    const initialGradeSummary = Object.fromEntries(
        grades.map(grade => [grade, {
            sale_value: 0,
            sale_percentage: 0,
        }])
    )

    const summary = analysisData.reduce((acc, item) => {
        const saleAmount = safeNumber(item['Sale Amount'])
        const grade = (item['Static Grade'] || 'NEW') as keyof typeof initialGradeSummary

        acc.total += saleAmount

        if (grade in acc.gradeWiseSales) {
            acc.gradeWiseSales[grade].sale_value += saleAmount
        }

        return acc
    }, {
        total: 0,
        gradeWiseSales: initialGradeSummary
    })

    Object.values(summary.gradeWiseSales).forEach(grade => {
        if (summary.total > 0) {
            grade.sale_percentage = roundToDecimals((grade.sale_value / summary.total) * 100)
        }
        grade.sale_value = roundToDecimals(grade.sale_value)
    })

    return {
        total_Sale: roundToDecimals(summary.total),
        rows: Object.entries(summary.gradeWiseSales).map(([grade, data]) => ({
            grade,
            ...data
        })),
        cols: ['grade', 'sale_value', 'sale_percentage']
    }
}

function calcInventoryMIS(analysisData: MonthDataItem[]) {
    const initialGradeSummary = Object.fromEntries(
        grades.map(grade => [grade, {
            inventory_value: 0,
            inventory_percentage: 0
        }])
    )

    const summary = analysisData.reduce((acc, item) => {
        const availableInventory = safeNumber(item['Available Inventory'])
        const vendorPrice = safeNumber(item['Vendor Price'])
        const grade = (item['Static Grade'] || 'NEW') as keyof typeof initialGradeSummary

        const inventoryValue = availableInventory * vendorPrice
        acc.totalInventory += inventoryValue

        if (grade in acc.gradeWiseSales) {
            acc.gradeWiseSales[grade].inventory_value += inventoryValue
        }

        return acc
    }, {
        totalInventory: 0,
        gradeWiseSales: initialGradeSummary
    })

    // Calculate percentages and round values
    Object.values(summary.gradeWiseSales).forEach(grade => {
        if (summary.totalInventory > 0) {
            grade.inventory_percentage = roundToDecimals((grade.inventory_value / summary.totalInventory) * 100)
        }
        grade.inventory_value = roundToDecimals(grade.inventory_value)
    })

    return {
        total_Inventory: roundToDecimals(summary.totalInventory),
        rows: Object.entries(summary.gradeWiseSales).map(([grade, data]) => ({
            grade,
            ...data
        })),
        cols: ['grade', 'inventory_value', 'inventory_percentage']
    }
}

function calcOrderSummary(analysisData: MonthDataItem[]) {
    const summary = analysisData.reduce((acc, item) => {
        const label = item["Category Name"]
        const subCategory = item["Sub Category"]

        if (excludeSubCategoryOrderSummary.includes(subCategory)) {
            return acc
        }

        if (!acc[label]) {
            acc[label] = {
                Sale_Quantity: 0,
                Order_Quantity: 0,
                Order_Value: 0
            }
        }

        const entry = acc[label]
        entry.Sale_Quantity += safeNumber(item["Sale Qty"])
        entry.Order_Quantity += safeNumber(item["Order Qty"])
        entry.Order_Value += safeNumber(item["Total Amount"])

        return acc
    }, {} as Record<string, OrderSummaryItem>)

    return {
        rows: Object.entries(summary).filter(Boolean).map(([category, data]) => ({
            category,
            Sale_Quantity: roundToDecimals(data.Sale_Quantity),
            Order_Quantity: roundToDecimals(data.Order_Quantity),
            Order_Value: roundToDecimals(data.Order_Value)
        })),
        cols: ['category', 'Sale_Quantity', 'Order_Quantity', 'Order_Value']
    }
}

function commonOrderSummary(analysisData: MonthDataItem[]) {
    return analysisData.map(order => ({
        item: order['Parent SKU'],
        category: order['Category Name'],
        sub_category: order['Sub Category'],
        order_qty: order['Order Qty'],
        vendor_name: order['Vendor Name'],
        vendor_price: order['Vendor Price'],
        total_value: calcCommonOrderTotalValue(order['Order Qty'], order['Vendor Price'])
    }))
}

function calcCommonOrderTotalValue(orderQty: string, vendorPrice: string) {
    return roundToDecimals(
        safeNumber(orderQty) * safeNumber(vendorPrice)
    )
}