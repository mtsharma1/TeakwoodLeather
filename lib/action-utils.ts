import { exit } from "process";
import { MULTIPLE_SELLING_PRICE } from "./helper";

// Interfaces for the input data structures
interface InputItem {
    "Sku Code": string;
    "Parent SKU": string;
    "Size": string;
    "Category Name": string;
    "Sub Category": string;
    "Sale Qty": string;
    "Sale Amount": string;
    "Vendor Name": string;
    "Static Grade": string;
    "Month Grade": string;
    "Available Inventory": string;
    "Open Purchase": string;
    "Required Qty": string;
    "Order Qty": string;
    "Sale Through": string;
    "Vendor Price": string;
    "Total Amount": string;
    "Sku Code ID ": string;
    "Days of positive inventory": string;
}

interface SupportItem {
    "Category": string;
    "Sub Category": string;
    "Sub Category New"?: string;
    "Ratio Sum": number;
    "Ratio": number;
    "Size": number;
}

interface Utils {
    monthGrade: {
        [key: string]: number;
    };
}

interface GradeResult {
    grade?: string;
    rank: number;
}

interface OutputItem extends InputItem {
    "ROH": number;
    "DOH": number;
    "New SKU Code": string;
    "Static Grade_N": number;
    "Month Grade_N": number;
    "Comment": string;
    "Avg Selling Price": number;
    "Multiple Price": number;
}



export function transformData(
    INPUT: InputItem[],
    SUPPORT: SupportItem[],
    UTILS: Utils
): OutputItem[] {
    // Helper function to get support data based on subcategory and size
    function getSupportData(subCategory: string, size: string): SupportItem | undefined {
        const lookupKey = `${subCategory}_${size}`;
        return SUPPORT.find(item => {
            const supportKey = item["Sub Category New"] || item["Sub Category"];
            return supportKey === lookupKey || supportKey === subCategory;
        });
    }

    // Helper function to calculate sum of sales qty for distinct parent SKU
    function getSumOfSalesQty(parentSkuCode: string): number {
        return INPUT.reduce((sum, item) => {
            if (item["Parent SKU"] === parentSkuCode) {
                return sum + Number(item["Sale Qty"]);
            }
            return sum;
        }, 0);
    }

    // Helper function to calculate sum of sales amount for distinct parent SKU
    function getSumOfSalesAmount(parentSkuCode: string): number {
        return INPUT.reduce((sum, item) => {
            if (item["Parent SKU"] === parentSkuCode) {
                return sum + Number(item["Sale Amount"]);
            }
            return sum;
        }, 0);
    }

    function calcGrade(saleQty: number): string {
        if (saleQty > 30) {
            return "A";
        }
        else if (saleQty >= 10 && saleQty <= 30) {
            return "B";
        }
        else {
            return "C";
        }
    }

    function calcMonthGrade(saleQty: number): GradeResult {
        const grade = calcGrade(saleQty);
        const gradeUtil = UTILS['monthGrade'];
        return { grade, rank: gradeUtil[grade] };
    }

    function calcStaticGrade(saleQty: string): GradeResult {
        const gradeUtil = UTILS['monthGrade'];
        return { rank: gradeUtil[saleQty] };
    }

    const replaceCategory = {
        "LEATHER WOMEN CASUAL BELT": "LEATHER WOMEN CASUAL BELT",
        "LEATHER KID SHOES": "LEATHER KID SHOES",
        "LEATHER WOMEN SHOES": "LEATHER WOMEN SHOES",
    }

    return INPUT.map(item => {
        const supportData = getSupportData(item["Sub Category"], item.Size);
        const sumSalesQty = getSumOfSalesQty(item["Parent SKU"]);
        const sumSalesAmount = getSumOfSalesAmount(item["Parent SKU"]);
        const monthlyGrade = calcMonthGrade(Number(item["Sale Qty"]));
        const staticGrade = calcStaticGrade(item["Static Grade"]);
        const categoryName = replaceCategory?.[item["Sub Category"]] ?? item["Category Name"]


        const availableInventory = Number(item["Available Inventory"]) || 0;
        const openPurchase = Number(item["Open Purchase"]) || 0;
        const saleQty = Number(item["Sale Qty"]) || 0;
        const daysPositive = Number(item["Days of positive inventory"]) || 0;
        const vendorPrice = Number(item["Vendor Price"]) || 0;

        const requiredQty = (saleQty * 2) - (availableInventory + openPurchase);

        const orderQty = supportData ?
            Math.max(0, Math.ceil(
                ((sumSalesQty * 2) / (supportData["Ratio Sum"] || 1)) *
                (supportData["Ratio"] || 0) -
                (availableInventory + openPurchase)
            )) : 0;

        const saleThrough = ((saleQty / (availableInventory + saleQty)) * 100) || 0;
        const totalAmount = vendorPrice * orderQty;
        const roh = daysPositive ? (saleQty / daysPositive) : 0;
        const doh = roh ? (availableInventory / roh) : 0;
        const avgSellingPrice = (sumSalesAmount / sumSalesQty) || 0;

        return {
            ...item,
            "Category Name": categoryName,
            "Required Qty": requiredQty.toString(),
            "Order Qty": orderQty.toString(),
            "Sale Through": saleThrough.toFixed(2),
            "Total Amount": totalAmount.toString(),
            "ROH": roh,
            "DOH": doh,
            "New SKU Code": `${item["Sku Code"]}_${item.Size}`,
            "Static Grade_N": staticGrade.rank,
            "Month Grade": monthlyGrade.grade,
            "Month Grade_N": monthlyGrade.rank,
            "Comment": item["Month Grade"] ?
                (Number(item["Month Grade"]) > Number(item["Static Grade"]) ? "Degrade" :
                    Number(item["Month Grade"]) < Number(item["Static Grade"]) ? "Upgrade" :
                        "No Change") : "",
            "Avg Selling Price": avgSellingPrice,
            "Multiple Price": vendorPrice ? (avgSellingPrice / vendorPrice || 0) : 0
        } as OutputItem;
    });
}


export function processSalesData(data) {
    // Create a Map instead of an object for better performance
    const salesDataMap = new Map();

    data.forEach(row => {
        const sku = row['Item SKU Code']?.trim();
        const price = parseFloat(row['Selling Price']) || 0;
        const isCompletedSales = row['Sale Order Status'] === 'COMPLETE'

        if (isCompletedSales) {
            if (!salesDataMap.has(sku)) {
                salesDataMap.set(sku, {
                    rowLabel: sku,
                    countOfItemSKUCode: 0,
                    sumOfSellingPrice: 0
                });
            }

            const skuInfo = salesDataMap.get(sku);
            skuInfo.countOfItemSKUCode += 1;
            skuInfo.sumOfSellingPrice += price;
        }
    });



    // Return an array of values, maintaining your original output format
    return salesDataMap;
}

function calcSalesGrid(analysisData) {
    const summary = {
        total: 0,
        totalInventory: 0,
        gradeWiseSales: {
            'A': { saleValue: 0, salePercentage: 0, inventoryValue: 0, inventoryPercentage: 0 },
            'B': { saleValue: 0, salePercentage: 0, inventoryValue: 0, inventoryPercentage: 0 },
            'C': { saleValue: 0, salePercentage: 0, inventoryValue: 0, inventoryPercentage: 0 },
            'D': { saleValue: 0, salePercentage: 0, inventoryValue: 0, inventoryPercentage: 0 },
            'A+': { saleValue: 0, salePercentage: 0, inventoryValue: 0, inventoryPercentage: 0 },
            'NEW': { saleValue: 0, salePercentage: 0, inventoryValue: 0, inventoryPercentage: 0 }
        }
    };

    analysisData.forEach(item => {
        const saleAmount = Number(item['Sale Amount']) || 0;
        const inventoryAmount = Number(item['Available Inventory']);
        const grade = item['Static Grade'] || 'NEW';

        summary.total += saleAmount;
        summary.totalInventory += inventoryAmount;

        if (summary.gradeWiseSales[grade]) {
            summary.gradeWiseSales[grade].saleValue += saleAmount;
            summary.gradeWiseSales[grade].inventoryValue += inventoryAmount;
        }
    });

    Object.keys(summary.gradeWiseSales).forEach(grade => {
        const gradeData = summary.gradeWiseSales[grade];

        if (summary.total > 0) {
            gradeData.salePercentage = Number(
                ((gradeData.saleValue / summary.total) * 100).toFixed(2)
            );
        }

        if (summary.totalInventory > 0) {
            gradeData.inventoryPercentage = Number(
                ((gradeData.inventoryValue / summary.totalInventory) * 100).toFixed(2)
            );
        }

        gradeData.saleValue = Number(gradeData.saleValue.toFixed(2));
        gradeData.inventoryValue = Number(gradeData.inventoryValue.toFixed(2));
    });

    summary.total = Number(summary.total.toFixed(2));
    summary.totalInventory = Number(summary.totalInventory.toFixed(2));

    const rows = Object.keys(summary.gradeWiseSales).map(grade => ({
        grade,
        saleValue: summary.gradeWiseSales[grade].saleValue,
        salePercentage: summary.gradeWiseSales[grade].salePercentage,
        inventoryValue: summary.gradeWiseSales[grade].inventoryValue,
        inventoryPercentage: summary.gradeWiseSales[grade].inventoryPercentage
    }));

    const cols = [
        'grade',
        'saleValue',
        'salePercentage',
        'inventoryValue',
        'inventoryPercentage',
    ];

    return { totalSale: summary.total, totalInventory: summary.totalInventory, rows, cols };
}

function calcOrderSummary(analysisData) {
    const summary = analysisData.reduce((acc, item) => {
        const label = item["Category Name"];
        if (!acc[label]) {
            acc[label] = {
                totalSaleValue: 0,
                totalQuantity: 0,
                totalOrderValue: 0
            };
        }
        acc[label].totalSaleValue += Number(item["Sale Amount"]);
        acc[label].totalQuantity += Number(item["Sale Qty"]);
        acc[label].totalOrderValue += Number(item["Total Amount"]);
        return acc;
    }, {});

    const rows = Object.keys(summary).map(label => ({
        category: label,
        totalSaleValue: summary[label].totalSaleValue.toFixed(2),
        totalQuantity: summary[label].totalQuantity.toFixed(2),
        totalOrderValue: summary[label].totalOrderValue.toFixed(2)
    }));

    const cols = [
        'category',
        'totalSaleValue',
        'totalQuantity',
        'totalOrderValue',
    ];

    return { rows, cols };
}

function commonOrderSummary(analysisData) {
    return analysisData.map((order) => ({
        item: order['Sku Code'],
        category: order['Category Name'],
        subCategory: order['Sub Category'],
        orderQty: order['Order Qty'],
        vendorName: order['Vendor Name'],
        vendorPrice: order['Vendor Price'],
        totalValue: (Number(order['Order Qty']) * Number(order['Vendor Price'])).toFixed(2)
    }))
}

export async function analysis(analysisData, key) {
    let result;

    switch (key) {
        case 'overstock':
            result = analysisData.filter((item) => item.DOH > 180);
            break;
        case 'understock':
            result = analysisData.filter((item) => item.DOH < 30);
            break;
        case 'underprice2':
            result = analysisData.filter((item) => item['Multiple Price'] < MULTIPLE_SELLING_PRICE);
            break;
        case 'salesinventorsSummary':
            result = calcSalesGrid(analysisData);
            break;
        case 'ordersummary':
            result = calcOrderSummary(analysisData);
            break;
        case 'commonordersummary':
            result = commonOrderSummary(analysisData);
            break;
        default:
            result = {
                overStock: analysisData.filter((item) => item.DOH > 180),
                underStock: analysisData.filter((item) => item.DOH < 30),
                underPrice2: analysisData.filter((item) => item['Multiple Price'] < MULTIPLE_SELLING_PRICE),
                salesInventorySummary: calcSalesGrid(analysisData),
                orderSummary: calcOrderSummary(analysisData),
            };
            break;
    }

    return result;
}