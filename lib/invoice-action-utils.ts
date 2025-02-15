import { PriceCheckInvoiceData, InvoiceData } from "@/types/order";
import { roundToDecimals, safeNumber } from "./utils";

export function transformInvoiceData(INPUT: InvoiceData[]): PriceCheckInvoiceData[] {
    const calculateStatus = (
        multiplePrice: number,
        channelName: string,
        grade: string
    ): string => {
        const channelRules = invoiceSupportData.filter((rule) => rule.channel === channelName);


        for (const rule of channelRules) {
            const threshold = rule[grade];
            if (
                (rule.condition === "<" && multiplePrice < Number(threshold)) ||
                (rule.condition === ">=" && multiplePrice >= Number(threshold))
            ) {
                return rule.status;
            }
        }

        return "UNKNOWN";
    };


    const calculateMultiplePrice = (totalCost: number, invoiceTotal: number): number => {
        if (totalCost === 0) return 0;
        return roundToDecimals(safeNumber((invoiceTotal / totalCost)), 3);
    };

    const aggregatedData = new Map<string, { skuCodes: string[]; totalCost: number; invoiceTotal: number }>();
    const uniqueInvoices = new Set<string>();


    return INPUT.map((item) => {
        const skuCodes = item["SKU Code"];
        const invoiceTotal = safeNumber(item["Invoice Total"]);
        const costPrice = roundToDecimals(safeNumber(item["Cost Price"]));
        const invoiceNo = item["Invoice No"];

        uniqueInvoices.add(invoiceNo);

        if (!aggregatedData.has(skuCodes)) {
            aggregatedData.set(skuCodes, {
                skuCodes: [],
                totalCost: 0,
                invoiceTotal: 0,
            });
        }
        const aggregated = aggregatedData.get(skuCodes)!;
        aggregated.skuCodes.push(item["SKU Code"]);
        aggregated.totalCost += costPrice;
        aggregated.invoiceTotal += invoiceTotal;

        const multiplePrice = calculateMultiplePrice(aggregated.totalCost, aggregated.invoiceTotal);

        const status = calculateStatus(multiplePrice, item["Channel Name"], item["Grade"]);

        const sellingPriceBelow300 = invoiceTotal < 300 ? "True" : "False";

        const discountPercentage = item["MRP"]
            ? Math.round(((item["MRP"] - invoiceTotal) / item["MRP"]) * 100)
            : 0;

        return {
            ...item,
            "Concate Article": aggregated.skuCodes.join(" | "),
            "Total Cost": aggregated.totalCost.toString(),
            "Total Selling Price": aggregated.invoiceTotal.toString(),
            "Multiple Price": multiplePrice,
            "Status": status,
            "Selling Price < 300": sellingPriceBelow300,
            "Discount %": `${discountPercentage}%`,
            "Invoice Count": uniqueInvoices.size.toString()
            //   "Business Type": item["Business Type"] || "",
        };
    });
}

export function invoiceGradeAnalysis(analysisData: PriceCheckInvoiceData[]) {
    const grades = ['A', 'B', 'C', 'D', 'A+', 'NEW'] as const;

    const initialGradeSummary = Object.fromEntries(
        grades.map(grade => [grade, { saleValue: 0, salePercentage: 0 }])
    ) as Record<typeof grades[number], { saleValue: number; salePercentage: number }>;

    const summary = analysisData.reduce((acc, item) => {
        const saleAmount = safeNumber(item['Invoice Total']);
        const grade = (item['Grade'] || 'NEW') as keyof typeof initialGradeSummary;

        acc.totalSale += saleAmount;

        if (grade in acc.gradeWiseSales) {
            acc.gradeWiseSales[grade].saleValue += saleAmount;
        }

        return acc;
    }, {
        totalSale: 0,
        gradeWiseSales: initialGradeSummary
    });

    Object.values(summary.gradeWiseSales).forEach(grade => {
        grade.salePercentage = summary.totalSale > 0
            ? roundToDecimals((grade.saleValue / summary.totalSale) * 100)
            : 0;
        grade.saleValue = roundToDecimals(grade.saleValue);
    });

    return {
        totalSale: roundToDecimals(summary.totalSale),
        rows: Object.entries(summary.gradeWiseSales).map(([grade, data]) => ({
            grade,
            ...data
        })),
        cols: ['grade', 'saleValue', 'salePercentage']
    };
}


type InvoiceSupportRule = {
    channel: string;
    condition: string;
    status: string;
    [grade: string]: string | number;
};

// Will store in DB: invoiceSupportData [26-01-2025]
const invoiceSupportData: InvoiceSupportRule[] = [
    {
        "channel": "FLIPKART",
        "condition": "<",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "STOP"
    },
    {
        "channel": "FLIPKART",
        "condition": ">=",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "OKAY"
    },
    {
        "channel": "MYNTRAPPMP",
        "condition": "<",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "STOP"
    },
    {
        "channel": "MYNTRAPPMP",
        "condition": ">=",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "OKAY"
    },
    {
        "channel": "AMAZON_IN_API",
        "condition": "<",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "STOP"
    },
    {
        "channel": "AMAZON_IN_API",
        "condition": ">=",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "OKAY"
    },
    {
        "channel": "TATA_CLIQ",
        "condition": "<",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "STOP"
    },
    {
        "channel": "TATA_CLIQ",
        "condition": ">=",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "OKAY"
    },
    {
        "channel": "CRED",
        "condition": "<",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "STOP"
    },
    {
        "channel": "CRED",
        "condition": ">=",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "OKAY"
    },
    {
        "channel": "SHOPIFY",
        "condition": "<",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "STOP"
    },
    {
        "channel": "SHOPIFY",
        "condition": ">=",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "OKAY"
    },
    {
        "channel": "MYNTRAPPMP",
        "condition": "<",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "STOP"
    },
    {
        "channel": "MYNTRAPPMP",
        "condition": ">=",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "OKAY"
    },
    {
        "channel": "NYKAA_COM",
        "condition": "<",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "STOP"
    },
    {
        "channel": "NYKAA_COM",
        "condition": ">=",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "OKAY"
    },
    {
        "channel": "NYKAA_FASHION",
        "condition": "<",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "STOP"
    },
    {
        "channel": "NYKAA_FASHION",
        "condition": ">=",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "OKAY"
    },
    {
        "channel": "CRED-APSIS",
        "condition": "<",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "STOP"
    },
    {
        "channel": "CRED-APSIS",
        "condition": ">=",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "OKAY"
    },
    {
        "channel": "AMAZON_FLEX_API_XNWM",
        "condition": "<",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "STOP"
    },
    {
        "channel": "AMAZON_FLEX_API_XNWM",
        "condition": ">=",
        "A": 3.5,
        "B": 3.5,
        "New": 3.5,
        "C": 2.65,
        "D": 1.75,
        "status": "OKAY"
    },
    {
        "channel": "AJIO",
        "condition": ">=",
        "A": 1.96,
        "B": 1.96,
        "New": 1.96,
        "C": 1.47,
        "D": 0.98,
        "status": "OKAY"
    },
    {
        "channel": "AJIO",
        "condition": "<",
        "A": 1.96,
        "B": 1.96,
        "New": 1.96,
        "C": 1.47,
        "D": 0.98,
        "status": "STOP"
    },
    {
        "channel": "AJIO_DROPSHIP_suitcase",
        "condition": ">=",
        "A": 1.96,
        "B": 1.96,
        "New": 1.96,
        "C": 1.47,
        "D": 0.98,
        "status": "OKAY"
    },
    {
        "channel": "AJIO_DROPSHIP_suitcase",
        "condition": "<",
        "A": 1.96,
        "B": 1.96,
        "New": 1.96,
        "C": 1.47,
        "D": 0.98,
        "status": "STOP"
    },
    {
        "channel": "AJIO_DROPSHIP",
        "condition": ">=",
        "A": 1.96,
        "B": 1.96,
        "New": 1.96,
        "C": 1.47,
        "D": 0.98,
        "status": "OKAY"
    },
    {
        "channel": "AJIO_DROPSHIP",
        "condition": "<",
        "A": 1.96,
        "B": 1.96,
        "New": 1.96,
        "C": 1.47,
        "D": 0.98,
        "status": "STOP"
    },
    {
        "channel": "cocoblu",
        "condition": ">=",
        "A": 1.96,
        "B": 1.96,
        "New": 1.96,
        "C": 1.47,
        "D": 0.98,
        "status": "OKAY"
    },
    {
        "channel": "cocoblu",
        "condition": "<",
        "A": 1.96,
        "B": 1.96,
        "New": 1.96,
        "C": 1.47,
        "D": 0.98,
        "status": "STOP"
    },
    {
        "channel": "FIRSTCRY",
        "condition": ">=",
        "A": 1.96,
        "B": 1.96,
        "New": 1.96,
        "C": 1.47,
        "D": 0.98,
        "status": "OKAY"
    },
    {
        "channel": "FIRSTCRY",
        "condition": "<",
        "A": 1.96,
        "B": 1.96,
        "New": 1.96,
        "C": 1.47,
        "D": 0.98,
        "status": "STOP"
    }
];

/*********HELPER*********/
export const filterInvoices = (transformedData: PriceCheckInvoiceData[], start: Date, end: Date) => {
    return transformedData.filter((item) => {
        const invoiceDate = new Date(item["Invoice Created Date"]);
        return invoiceDate >= start && invoiceDate <= end;
    });
};
