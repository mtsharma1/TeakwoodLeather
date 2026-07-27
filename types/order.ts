
// Types and interfaces
export interface InputItem {
    "Sku Code": string
    "Parent SKU": string
    "Size": string
    "Category Name": string
    "Sub Category": string
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
    "Sale Qty": number
    "Sale Amount": number
}

export interface SalesDataItem {
    'Item SKU Code': string
    'Selling Price': string
    'Sale Order Status': string
}

export interface MonthDataItem extends InputItem {
    "ROS": number
    "DOH": number
    "Static Grade_N": number
    "Month Grade_N": number
    "Avg Selling Price": number
    "Multiple Price": number
    "Comment": string
    "New SKU Code": string
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
    sale_value: number
    sale_percentage: number
    // inventory_value: number
    // inventory_percentage: number
}

export interface OrderSummaryItem {
    Sale_Quantity: number
    Order_Quantity: number
    Order_Value: number
}

export type InvoiceData = {
    "Order No": string;
    "Invoice No": string;
    "Shipping Package Code": string;
    "Shipping Package Status Code": string;
    "Invoice Created Date": string;
    "Channel Invoice Created Date": string;
    "EWayBill No": string;
    "EWayBill Date": string;
    "EWayBill Valid Till": string;
    "Customer Name": string;
    "SKU Code": string;
    "SKU Name": string;
    "Quantity": number;
    "Invoice Tax": number;
    "Invoice Total": number;
    "Invoice Cancelled": string;
    "HSN Code": number;
    "GST Tax Type Code": number;
    "Tax Type Code": number;
    "CGST": number;
    "IGST": number;
    "SGST": number;
    "UTGST": number;
    "VAT": number;
    "CST": number;
    "Additional Tax": number;
    "Additional Tax Percentage": number;
    "Tax Percentage": number;
    "CESS": number;
    "CGST Rate": number;
    "IGST Rate": number;
    "SGST Rate": number;
    "UTGST Rate": number;
    "CESS Rate": number;
    "Shipping Charge": number;
    "COD Charge": number;
    "TCS Amount": number;
    "Channel Name": string;
    "Uniware Invoice Code": string;
    "Adjustment In Selling Price": number;
    "Adjustment In Discount": number;
    "Grade": string;
    "MRP": number;
    "Color": string;
    "Brand": string;
    "Size": string;
    "Seller Sku Code": string;
    "Cost Price": number;
    "Business Type": string;
};

export type PriceCheckData = {
    // "Business Type": string;
    "Concate Article": string;
    "Total Cost": string;
    "Total Selling Price": string;
    "Status": string;
    "Selling Price < 300": string;
    "Invoice Count": string; // Count of Articals
    "Discount %": string;
    "Multiple Price": string;
};

export type PriceCheckInvoiceData = InvoiceData & PriceCheckData;



export type ReturnCourierData = {
    "Sale Order No": string;
    "Shipping Package Code": string;
    "Shipping Package Status": string;
    "Shipping Provider": string;
    "Shipping Courier": string;
    "AWB No": string;
    "Return Delivery Date": string;
    "RTO Reason": string;
    "Created": string;
    "Channel Created": string;
    "Return Manifest Code": string;
    "Return Manifest Added": string;
    "Return Manifest Status": string;
    "Return Manifest Created By": string;
    "Return Manifest Created At": string;
    "Reshipment Action": string;
    "Channel": string;
    "Putaway No": string;
    "Putaway Status"?: string;
    "Putaway By": string;
    "Putaway Date": string;
    "Dispatch Facility": string;
    "Return Facility": string;
};

export type ReturnReverseData = {
    "Sale Order Item Code": string;
    "Sale Order Created": string;
    "Sale Order Code": string;
    "Item Type Name": string;
    "Item Type SKU": string;
    "Reverse Pickup Code": string;
    "Tracking Number": string;
    "Dispatched Date": string;
    "Reference Code": string;
    "Import Reference Id": string;
    "Reverse Pickup Created": string;
    "Reverse Pickup Updated": string;
    "Reverse Pickup Status": string;
    "Reverse Pickup Action": string;
    "Return Reason": string;
    "Customer Image Url": string;
    "Replacement Sale Order Code": string;
    "Channel": string;
    "Total Received Items": number;
    "QC Comments": string;
    "Reverse Pickup Created By": string;
    "Putaway Code": string;
    "Created By": string;
    "Putaway Status": string;
    "Putaway Last Updated": string;
    "Courier Provider Name": string;
    "Return Item Status": string;
    "Shipping Courier Status": string;
    "Shipping Tracking Status": string;
    "Item Seal Id": string;
    "Return Delivery Date": string;
    "Channel Return Created Date": string;
    "Return Courier Name": string;
    "Return Remarks": string;
};

export interface Metrics {
    skuName: string;
    yesterday_Qty: number;
    today_Qty: number;
    total: number;
    invoice_Total: number;
    asp: number;
}


export interface ProcessedData {
    portal: string;
    yesterday_Orders: number;
    today_Orders: number;
    total: number;
}

export type ProductData = {
    'Product Code': string;
    'Name': string;
    'Color': string;
    'Size': string;
    'Brand': string;
    'Tags'?: string;
    'Image Url': string;
    'Product Page Url'?: string;
    'Category Name': string;
    'Type': string;
    'Sku Type': string;
    'Month Grade'?: string;
    'Parent SKU': string;
    'Product Title'?: string;
    'Image Url 1'?: string;
    'Image Url 2'?: string;
    'Image Url 3'?: string;
    'Image Url 4'?: string;
    'Image Url 5'?: string;
    'Image Url 6'?: string;
    'URL 7'?: string;
    'URL 8'?: string;
    'Vendor Name': string;
};


export type TranzactReportValue = string | number | null;

export interface TranzactPurchaseOrderReport {
    [key: string]: unknown;
    supplier_reference_id?: TranzactReportValue;
    document_date?: TranzactReportValue;
    last_modified_date?: TranzactReportValue;
    document_status?: TranzactReportValue;
    goods_status?: TranzactReportValue;
    invoice_status?: TranzactReportValue;
    amendment_counter?: TranzactReportValue;
    currency_text?: TranzactReportValue;
    doc_delivery_date?: TranzactReportValue;
    no_of_items?: TranzactReportValue;
    drafter_name?: TranzactReportValue;
    creator_name?: TranzactReportValue;
    buyer_store_name?: TranzactReportValue;
    transaction_id?: TranzactReportValue;
    supplier_name?: TranzactReportValue;
    document_no_text?: TranzactReportValue;
    itemId?: TranzactReportValue;
    itemDescription?: TranzactReportValue;
    itemCategory?: TranzactReportValue;
    poQuantity?: TranzactReportValue;
    uom?: TranzactReportValue;
    itemRate?: TranzactReportValue;
    itemRateAfterDiscount?: TranzactReportValue;
    itemTotal?: TranzactReportValue;
    itemDiscountAmount?: TranzactReportValue;
    itemValueBeforeTax?: TranzactReportValue;
    cgstRate?: TranzactReportValue;
    cgst?: TranzactReportValue;
    sgstRate?: TranzactReportValue;
    sgst?: TranzactReportValue;
    igstRate?: TranzactReportValue;
    igst?: TranzactReportValue;
    cessRate?: TranzactReportValue;
    cess?: TranzactReportValue;
    itemTax?: TranzactReportValue;
    itemValueAfterTax?: TranzactReportValue;
    itemComment?: TranzactReportValue;
    deliveredQuantity?: TranzactReportValue;
    deliveredValue?: TranzactReportValue;
    balanceQuantity?: TranzactReportValue;
    balanceValue?: TranzactReportValue;
    drafterName?: TranzactReportValue;
    storeName?: TranzactReportValue;
    documentSerialNumber?: TranzactReportValue;
}


