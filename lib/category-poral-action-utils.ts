import { Metrics, PriceCheckInvoiceData, ProcessedData } from "@/types/order"
import { roundToDecimals, safeNumber } from "./utils"
import prisma from "./prisma";
import { FILENAME } from "@prisma/client";

export const calculateCategoryMetrics = async (
    yesterdayOrders: PriceCheckInvoiceData[],
    todayOrders: PriceCheckInvoiceData[]
): Promise<{ metrics: Metrics[], totals: Metrics }> => {

    const uniqueSkus = new Set([
        ...yesterdayOrders.map((order) => order["SKU Name"]),
        ...todayOrders.map((order) => order["SKU Name"])
    ]);


    const categoryTallyReport = await prisma.tallyReportT.findMany({
        where: {
            reportfileName: FILENAME.CATEGORY
        }
    })

    const skuMetrics = Array.from(uniqueSkus).map((skuName): Metrics => {
        const skuYesterday = yesterdayOrders.filter((order) => order["SKU Name"] === skuName);
        const skuToday = todayOrders.filter((order) => order["SKU Name"] === skuName);

        const yesterdayQty = skuYesterday.reduce(
            (sum, order) => sum + safeNumber(order.Quantity),
            0
        );
        const todayQty = skuToday.reduce(
            (sum, order) => sum + safeNumber(order.Quantity),
            0
        );
        const total = yesterdayQty + todayQty;

        const invoiceTotal = [...skuYesterday, ...skuToday].reduce(
            (sum, order) => sum + safeNumber(order["Invoice Total"]),
            0
        );

        const asp = total > 0 ? invoiceTotal / total : 0;

        return {
            skuName,
            yesterday_Qty: yesterdayQty,
            today_Qty: todayQty,
            total,
            invoice_Total: roundToDecimals(safeNumber(invoiceTotal)),
            asp,
        };
    });

    const totals = skuMetrics.reduce(
        (acc: Metrics, curr: Metrics): Metrics => ({
            skuName: 'Total',
            yesterday_Qty: acc.yesterday_Qty + curr.yesterday_Qty,
            today_Qty: acc.today_Qty + curr.today_Qty,
            total: acc.total + curr.total,
            invoice_Total: acc.invoice_Total + curr.invoice_Total,
            asp: (acc.invoice_Total + curr.invoice_Total) / (acc.total + curr.total),
        }),
        {
            skuName: 'Total',
            yesterday_Qty: 0,
            today_Qty: 0,
            total: 0,
            invoice_Total: 0,
            asp: 0,
        }
    );

    const withPercentage = skuMetrics.map((metric) => ({
        ...metric,
        percentage: roundToDecimals((metric.total / totals.total) * 100),
        monthly_avg_sale: categoryTallyReport.find((report) => report.name === metric.skuName)?.monthAvg || 0
    }))

    return Promise.resolve({ metrics: withPercentage, totals });
};

export const calculatePortalMetrics = async (
    yesterdayOrders: PriceCheckInvoiceData[],
    todayOrders: PriceCheckInvoiceData[]
): Promise<{ metrics: ProcessedData[], totals: ProcessedData }> => {
    // Get unique channels
    const channels = new Set([
        ...yesterdayOrders.map((order) => order["Channel Name"]),
        ...todayOrders.map((order) => order["Channel Name"])
    ]);

    const portalTallyReport = await prisma.tallyReportT.findMany({
        where: {
            reportfileName: FILENAME.PORTAL
        }
    })

    const channelMetrics = Array.from(channels).map((channel): ProcessedData => {
        const yes_qty = yesterdayOrders.filter(
            (order) => order["Channel Name"] === channel
        );
        const today_qty = todayOrders.filter(
            (order) => order["Channel Name"] === channel
        );


        const total_yes_qty = yes_qty.reduce((acc, order) => acc + safeNumber(order.Quantity), 0)
        const total_today_qty = today_qty.reduce((acc, order) => acc + safeNumber(order.Quantity), 0)

        // Calculate total orders
        const total = total_yes_qty + total_today_qty;

        return {
            portal: channel,
            yesterday_Orders: total_yes_qty,
            today_Orders: total_today_qty,
            total,
        };
    });

    const totals = channelMetrics.reduce(
        (acc: ProcessedData, curr: ProcessedData): ProcessedData => ({
            portal: 'Total',
            yesterday_Orders: acc.yesterday_Orders + curr.yesterday_Orders,
            today_Orders: acc.today_Orders + curr.today_Orders,
            total: acc.total + curr.total,
        }),
        {
            portal: 'Total',
            yesterday_Orders: 0,
            today_Orders: 0,
            total: 0,
        }
    );

    const withPercentage = channelMetrics.map((channel) => ({
        ...channel,
        percentage: roundToDecimals((channel.total / totals.total) * 100),
        monthly_avg_sale: portalTallyReport.find((report) => report.name === channel.portal)?.monthAvg || 0
    }))


    return Promise.resolve({ metrics: withPercentage, totals });
};