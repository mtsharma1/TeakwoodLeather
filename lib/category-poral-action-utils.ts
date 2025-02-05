import { Metrics, PriceCheckInvoiceData, ProcessedData } from "@/types/order"
import { safeNumber } from "./utils"

export const calculateCategoryMetrics = (
    yesterdayOrders: PriceCheckInvoiceData[], 
    todayOrders: PriceCheckInvoiceData[]
): { metrics: Metrics[], totals: Metrics } => {

    const uniqueSkus = new Set([
        ...yesterdayOrders.map((order) => order["SKU Name"]),
        ...todayOrders.map((order) => order["SKU Name"])
    ]);

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
            yesterdayQty,
            todayQty,
            total,
            invoiceTotal,
            asp,
        };
    });

    const totals = skuMetrics.reduce(
        (acc: Metrics, curr: Metrics): Metrics => ({
            skuName: 'Total',
            yesterdayQty: acc.yesterdayQty + curr.yesterdayQty,
            todayQty: acc.todayQty + curr.todayQty,
            total: acc.total + curr.total,
            invoiceTotal: acc.invoiceTotal + curr.invoiceTotal,
            asp: (acc.invoiceTotal + curr.invoiceTotal) / (acc.total + curr.total),
        }),
        {
            skuName: 'Total',
            yesterdayQty: 0,
            todayQty: 0,
            total: 0,
            invoiceTotal: 0,
            asp: 0,
        }
    );

    return { metrics: skuMetrics, totals };
};

export const calculatePortalMetrics = (
    yesterdayOrders: PriceCheckInvoiceData[], 
    todayOrders: PriceCheckInvoiceData[]
): { metrics: ProcessedData[], totals: ProcessedData } => {
    // Get unique channels
    const channels = new Set([
        ...yesterdayOrders.map((order) => order["Channel Name"]),
        ...todayOrders.map((order) => order["Channel Name"])
    ]);

    const channelMetrics = Array.from(channels).map((channel): ProcessedData => {
        const yesterdayCount = yesterdayOrders.filter(
            (order) => order["Channel Name"] === channel
        ).length;

        const todayCount = todayOrders.filter(
            (order) => order["Channel Name"] === channel
        ).length;

        // Calculate total orders
        const total = yesterdayCount + todayCount;

        return {
            portal: channel,
            yesterdayOrders: yesterdayCount,
            todayOrders: todayCount,
            total,
        };
    });

    const totals = channelMetrics.reduce(
        (acc: ProcessedData, curr: ProcessedData): ProcessedData => ({
            portal: 'Total',
            yesterdayOrders: acc.yesterdayOrders + curr.yesterdayOrders,
            todayOrders: acc.todayOrders + curr.todayOrders,
            total: acc.total + curr.total,
        }),
        {
            portal: 'Total',
            yesterdayOrders: 0,
            todayOrders: 0,
            total: 0,
        }
    );

    return { metrics: channelMetrics, totals };
};