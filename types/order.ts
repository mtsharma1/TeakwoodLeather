
// Types and interfaces
export interface InputItem {
    "Sku Code": string
    "Parent SKU": string
    "Size": string
    "Category Name": string
    "Sub Category": string
    "Sale Qty": number
    "Sale Amount": number
    "Vendor Name": string
    "Static Grade": string
    "Month Grade": string
    "Available Inventory": string
    "Open Purchase": string
    "Required Qty": string
    "Order Qty": string
    "Sale Through": string
    "Vendor Price": string
    "Total Amount": string
    "Sku Code ID ": string
    "Days of positive inventory": string
}

export interface SalesDataItem {
    'Item SKU Code': string
    'Selling Price': string
    'Sale Order Status': string
}

export interface MonthDataItem extends InputItem {
    "ROH": number
    "DOH": number
    "New SKU Code": string
    "Static Grade_N": number
    "Month Grade_N": number
    "Comment": string
    "Avg Selling Price": number
    "Multiple Price": number
}

export interface SupportItem {
    "Category": string
    "Sub Category": string
    "Sub Category New"?: string
    "Ratio Sum": string
    "Ratio": string
    "Size": string
}

export interface Utils {
    monthGrade: Record<string, number>
}

export interface GradeResult {
    grade?: string
    rank: number
}

export interface SalesGridSummary {
    saleValue: number
    salePercentage: number
    inventoryValue: number
    inventoryPercentage: number
}

export interface OrderSummaryItem {
    totalSaleValue: number
    totalQuantity: number
    totalOrderValue: number
}
