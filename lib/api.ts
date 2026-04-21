import { unstable_noStore } from "next/cache"
import { CHANNEL_REPORT_API_BODY, ITEM_MASTER_DROPBOX_API_BODY, MONTHLY_REPORT_API_BODY, RETURN_INVOICE_API_BODY } from "./api-utils"

const BASE_URL = "https://teakwoodindia.unicommerce.com"

async function fetchWithAuth(url: string, options: RequestInit = {}) {
   unstable_noStore()
   const accessToken = await getAccessToken()
   const res = await fetch(url, {
      ...options,
      headers: {
         ...options.headers,
         Authorization: `Bearer ${accessToken}`,
         "Content-Type": "application/json",
         Facility: "teakwoodindia",
      },
   })

   if (!res.ok) {
      const errorBody = await res.text()
      throw new Error(`API call failed: ${res.status} ${res.statusText}\nBody: ${errorBody}`)
   }

   return res.json()
}

async function getAccessToken() {
   const url = `${BASE_URL}/oauth/token?grant_type=password&client_id=my-trusted-client&username=teakwoodleather45%40gmail.com&password=Leather%404511`
   const res = await fetch(url, {
      headers: {
         Cookie: "unicommerce=app3",
      },
   })

   if (!res.ok) {
      const errorBody = await res.text()
      throw new Error(`Failed to get access token: ${res.status} ${res.statusText}\nBody: ${errorBody}`)
   }

   const data = await res.json()
   if (!data.access_token) {
      throw new Error(`Access token not found in response: ${JSON.stringify(data)}`)
   }

   return data.access_token
}

async function createInvoiceJob(startDate: string, endDate: string) {
   const url = `${BASE_URL}/services/rest/v1/export/job/create`
   const body = {
      exportJobTypeName: "Invoice",
      exportColums: [
         "orderCode",
         "invoiceCode",
         "shippingPackageCode",
         "shippingPackageStatusCode",
         "invoiceDate",
         "channelInvoiceDate",
         "ewbNo",
         "ewbDate",
         "ewbValidTill",
         "customerName",
         "skuCode",
         "skuName",
         "quantity",
         "invoiceTax",
         "invoiceTotal",
         "invoiceCancelled",
         "hsn",
         "gstTaxCode",
         "invoiceTaxCode",
         "cgst",
         "igst",
         "sgst",
         "utgst",
         "vat",
         "cst",
         "additionalTax",
         "additionalTaxPercentage",
         "taxPercentage",
         "cess",
         "cgstrate",
         "igstrate",
         "sgstrate",
         "utgstrate",
         "cessrate",
         "shipping",
         "Cod",
         "TCSAmount",
         "channelName",
         "uniwareInvoiceCode",
         "ajustmentInSellingPrice",
         "ajustmentInDiscount",
         "grade",
         "mrp",
         "color",
         "brand",
         "size",
         "sellerSkuCode",
         "costprice",
      ],
      exportFilters: [
         {
            id: "dateCreatedRange",
            dateRange: {
               start: startDate,
               end: endDate,
            },
         },
      ],
      frequency: "ONETIME",
   }

   return fetchWithAuth(url, { method: "POST", body: JSON.stringify(body) })
}

async function createMontlyReportJob() {
   const url = `${BASE_URL}/services/rest/v1/export/job/create`
   return fetchWithAuth(url, { method: "POST", body: JSON.stringify(MONTHLY_REPORT_API_BODY) })
}

async function createChannelItemReportJob() {
   const url = `${BASE_URL}/services/rest/v1/export/job/create`
   return fetchWithAuth(url, { method: "POST", body: JSON.stringify(CHANNEL_REPORT_API_BODY) })
}

async function createItemMasterDropboxJob() {
   const url = `${BASE_URL}/services/rest/v1/export/job/create`
   return fetchWithAuth(url, { method: "POST", body: JSON.stringify(ITEM_MASTER_DROPBOX_API_BODY) })
}

async function createReturnInvoiceJob() {
   const url = `${BASE_URL}/services/rest/v1/export/job/create`
   return fetchWithAuth(url, { method: "POST", body: JSON.stringify(RETURN_INVOICE_API_BODY) })
}

function getLastTwoMonthsDateRangeISTMillis() {
   const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
   const nowUtc = new Date()
   const nowIst = new Date(nowUtc.getTime() + IST_OFFSET_MS)

   const istYear = nowIst.getUTCFullYear()
   const istMonth = nowIst.getUTCMonth()

   const startMonth = istMonth - 2
   const start = Date.UTC(istYear, startMonth, 1, 0, 0, 0, 0) - IST_OFFSET_MS
   const end = Date.UTC(istYear, istMonth, 1, 0, 0, 0, 0) - IST_OFFSET_MS - 1

   return { start, end }
}

const COURIER_RETURNS_EXPORT_COLUMNS = [
   "saleOrderNo",
   "shippingPackageCode",
   "shippingPackageStatus",
   "shippingProvider",
   "shippingCourier",
   "awbNo",
   "returnDeliveryDate",
   "rtoReason",
   "created",
   "channelCreated",
   "returnManifestCode",
   "returnManifestAdded",
   "returnManifestStatus",
   "returnManifestCreatedBy",
   "returnManifestCreatedAt",
   "reshipmentAction",
   "channel",
   "putawayNo",
   "putawayStatus",
   "putawayBy",
   "putawayDate",
   "dispatchFacility",
   "returnFacility",
]

async function createReturnCourierJob() {
   const url = `${BASE_URL}/services/rest/v1/export/job/create`
   const dateRange = getLastTwoMonthsDateRangeISTMillis()

   const body = {
      exportJobTypeName: "Courier Returns",
      exportColums: COURIER_RETURNS_EXPORT_COLUMNS,
      exportFilters: [
         {
            id: "soDateRange",
            dateRange,
         },
      ],
      frequency: "ONETIME",
   }

   return fetchWithAuth(url, { method: "POST", body: JSON.stringify(body) })
}

async function createReturnReverseJob() {
   const url = `${BASE_URL}/services/rest/v1/export/job/create`
   const dateRange = getLastTwoMonthsDateRangeISTMillis()

   const body = {
      exportJobTypeName: "Reverse Pickup",
      exportColums: [
         "saleOrderItemCode",
         "saleOrderCreated",
         "saleOrderCode",
         "itemtypeName",
         "itemtypeSku",
         "reversePickupCode",
         "trackingNumber",
         "dispatchedDate",
         "referenceCode",
         "importReferenceId",
         "reversePickupCreated",
         "reversePickupUpdated",
         "reversePickupStatus",
         "reversePickupAction",
         "returnReason",
         "customerImageUrl",
         "replacementSaleOrderCode",
         "channel",
         "totalReceivedItems",
         "qcComments",
         "reversePickupCreatedBy",
         "putawayCode",
         "createdBy",
         "putawayStatus",
         "putawayLastUpdated",
         "courierProvideName",
         "returnItemStatus",
         "shippingCourierStatus",
         "shippingTrackingStatus",
         "itemSealId",
         "returnDeliveryDate",
         "channelReturnCreatedDate",
         "returnCourierName",
         "returnRemarks",
      ],
      exportFilters: [
         {
            id: "reversePickupDateRange",
            dateRange,
         },
      ],
      frequency: "ONETIME",
   }

   return fetchWithAuth(url, { method: "POST", body: JSON.stringify(body) })
}

async function getJobStatus(jobCode: string) {
   const url = `${BASE_URL}/services/rest/v1/export/job/status?_=${Date.now()}`
   const body = { jobCode }
   return fetchWithAuth(url, { method: "POST", body: JSON.stringify(body) })
}

export {
   createInvoiceJob,
   createMontlyReportJob,
   getJobStatus,
   getAccessToken,
   createChannelItemReportJob,
   createItemMasterDropboxJob,
   createReturnInvoiceJob,
   createReturnCourierJob,
   createReturnReverseJob,
}
