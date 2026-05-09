import XLSX from "xlsx"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const excelPath = String.raw`E:\My Client\Teakwood\Website Development\New Version\Teakwood Leather mtsharma1\Purchase Order Tranzact.xlsx`

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0
  const parsed = Number(String(value).replace(/,/g, "").trim())
  return Number.isFinite(parsed) ? parsed : 0
}

async function run() {
  const wb = XLSX.readFile(excelPath)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" })

  const payload = rows.map((row) => ({
    poNumber: String(row["PO Number"] ?? ""),
    supplierName: String(row["Supplier Name"] ?? ""),
    supplierGstin: String(row["Supplier GSTIN"] ?? ""),
    supplierReferenceId: String(row["Supplier Reference ID"] ?? ""),
    documentDate: String(row["Document Date"] ?? ""),
    lastModifiedDate: String(row["Last Modified Date"] ?? ""),
    documentStatus: String(row["Document Status"] ?? ""),
    goodsStatus: String(row["Goods Status"] ?? ""),
    overdueStatus: String(row["Overdue Status"] ?? ""),
    invoicingStatus: String(row["Invoicing Status"] ?? ""),
    amendmentCounter: String(row["Amendment Counter"] ?? ""),
    foreignDomestic: String(row["Foreign/Domestic"] ?? ""),
    itemId: String(row["Item ID"] ?? ""),
    itemDescription: String(row["Item Description"] ?? ""),
    itemCategory: String(row["Item Category"] ?? ""),
    hsnSac: String(row["HSN/SAC"] ?? ""),
    goodsService: String(row["Goods/Service"] ?? ""),
    itemDeliveryDate: String(row["Item Delivery Date"] ?? ""),
    poQuantity: String(row["PO Quantity"] ?? ""),
    uom: String(row["UOM"] ?? ""),
    totalIndentQuantity: String(row["Total Indent Quantity"] ?? ""),
    indentNumber: String(row["Indent Number"] ?? ""),
    indentDate: String(row["Indent Date"] ?? ""),
    ocNumber: String(row["OC Number"] ?? ""),
    ocDate: String(row["OC Date"] ?? ""),
    itemRate: String(row["Item Rate (₹)"] ?? ""),
    discountPercentage: String(row["Discount Percentage"] ?? ""),
    itemRateAfterDiscount: String(row["Item Rate - After Discount (₹)"] ?? ""),
    itemTotalBeforeDiscount: String(row["Item Total - Before Discount (₹)"] ?? ""),
    itemDiscountAmount: String(row["Item Discount Amount (₹)"] ?? ""),
    itemValueBeforeTax: String(row["Item Value - Before Tax(₹)"] ?? ""),
    cgstRate: String(row["CGST Rate"] ?? ""),
    cgst: String(row["CGST (₹)"] ?? ""),
    sgstRate: String(row["SGST Rate"] ?? ""),
    sgst: String(row["SGST (₹)"] ?? ""),
    igstRate: String(row["IGST Rate"] ?? ""),
    igst: String(row["IGST (₹)"] ?? ""),
    cessRate: String(row["Cess Rate"] ?? ""),
    cess: String(row["Cess (₹)"] ?? ""),
    itemTax: String(row["Item Tax (₹)"] ?? ""),
    itemValueAfterTax: String(row["Item Value - After Tax (₹)"] ?? ""),
    itemComment: String(row["Item Comment"] ?? ""),
    deliveredQuantity: String(row["Delivered Quantity"] ?? ""),
    deliveredValue: String(row["Delivered Value (₹)"] ?? ""),
    balanceQuantity: toNumber(row["Balance Quantity"]),
    balanceValue: toNumber(row["Balance Value (₹)"]),
    qirAcceptedQuantity: String(row["QIR Accepted Quantity"] ?? ""),
    acceptedValue: String(row["Accepted Value (₹)"] ?? ""),
    balanceQuantityAsPerAccepted: String(row["Balance Quantity (as per Accepted)"] ?? ""),
    balanceValueAsPerAccepted: String(row["Balance Value (as per Accepted) (₹)"] ?? ""),
    invoiceQuantity: String(row["Invoice Quantity"] ?? ""),
    inwardInvoiceMismatch: String(row["Inward-Invoice Mismatch"] ?? ""),
    drafterName: String(row["Drafter Name"] ?? ""),
    senderName: String(row["Sender Name"] ?? ""),
    paymentTerm: String(row["Payment Term"] ?? ""),
    storeName: String(row["Store Name"] ?? ""),
    poDeliveryDate: String(row["PO Delivery Date"] ?? ""),
    kindAttention: String(row["Kind Attention"] ?? ""),
    poGrandTotal: String(row["PO Grand Total (₹)"] ?? ""),
    networkTags: String(row["Network Tags"] ?? ""),
    transactionTags: String(row["Transaction Tags"] ?? ""),
    documentSerialNumber: String(row["Document Serial Number"] ?? ""),
    customerDeliveryAddressName: String(row["Customer Delivery Address Name"] ?? ""),
    customerDeliveryAddress: String(row["Customer Delivery Address"] ?? ""),
    customerDeliveryAddressGstin: String(row["Customer Delivery Address GSTIN"] ?? ""),
    customerDeliveryAddressCity: String(row["Customer Delivery Address City"] ?? ""),
    customerDeliveryAddressState: String(row["Customer Delivery Address State"] ?? ""),
    customerDeliveryAddressCountry: String(row["Customer Delivery Address Country"] ?? ""),
    customerDeliveryAddressPin: String(row["Customer Delivery Address PIN"] ?? ""),
    customerBillingAddressGstin: String(row["Customer Billing Address GSTIN"] ?? ""),
    poOriginalCreationTimestamp: String(row["PO Original Creation Timestamp"] ?? ""),
    poLastModifiedTimestamp: String(row["PO Last Modified Timestamp"] ?? ""),
    transactionId: String(row["Transaction ID"] ?? ""),
    rowData: row,
  }))

  await prisma.purchaseOrderTranzactData.deleteMany()
  if (payload.length > 0) {
    await prisma.purchaseOrderTranzactData.createMany({ data: payload })
  }

  console.log(`Imported ${payload.length} purchase order rows.`)
}

run()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
