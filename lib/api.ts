import { unstable_noStore } from "next/cache"
import { CHANNEL_REPORT_API_BODY, ITEM_MASTER_DROPBOX_API_BODY, MONTHLY_REPORT_API_BODY, RETURN_INVOICE_API_BODY } from "./api-utils"
import type { TranzactPurchaseOrderReport } from "@/types/order"

const BASE_URL = "https://teakwoodindia.unicommerce.com"
const TRANZACT_BASE_URL = "https://be.letstranzact.com/main/login/password-login/"
const TRANZACT_REPORT_URL = "https://reporting.letstranzact.com/generate_report"

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
   const toUtcIsoString = (dateTime: string) => {
      const normalized = dateTime.includes("T") ? dateTime : dateTime.replace(" ", "T")
      const parsedDate = new Date(normalized)

      if (Number.isNaN(parsedDate.getTime())) {
         throw new Error(`Invalid date-time for invoice export: ${dateTime}`)
      }

      return parsedDate.toISOString()
   }

   const startDateUtc = toUtcIsoString(startDate)
   const endDateUtc = toUtcIsoString(endDate)
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
               start: startDateUtc,
               end: endDateUtc,
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
   const res = await fetch(url, { method: "POST", body: JSON.stringify(body) })

   if (!res.ok) {
      const errorBody = await res.text()
      throw new Error(`Failed to get job status: ${res.status} ${res.statusText}\nBody: ${errorBody}`)
   }

   return res.json()
}



async function getTranzactAccessToken() {
   unstable_noStore()
   // console.log("Fetching Tranzact access token...")
   const url = `${TRANZACT_BASE_URL}`
   const body = {
      "email": "teakwoodleather1@gmail.com",
      "password": "Teakwood@123"
   }
   const res = await fetch(url, {
      method: "POST",
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
   })

   if (!res.ok) {
      const errorBody = await res.text()
      throw new Error(`Failed to get access token: ${res.status} ${res.statusText}\nBody: ${errorBody}`)
   }

   const data = await res.json()
   console.log("Tranzact access token response:", data)
   if (!data) {
      throw new Error(`Access token not found in response: ${JSON.stringify(data)}`)
   }
   // console.log(data.data.access_token)
   return data.data.access_token
}


async function getPurchaseOrderRegisterReport(): Promise<TranzactPurchaseOrderReport[]> {

   console.log("Fetching Tranzact Purchase Order Register Report...")
   const url = `${TRANZACT_REPORT_URL}`
    const body = {
                  "selected_columns": [],
                  "grouped_data": false,
                  "selected_group_columns": [],
                  "initial_request": true,
                  "numeric_search_prefixes": {},
                  "report": {"id": "4"},
                  "search": {},
                  "pagination": {
                     "group_by": [],
                     "group_desc": [],
                     "items_per_page": 1000,
                     "multi_sort": false,
                     "must_sort": false,
                     "page": 1,
                     "sort_by": [],
                     "sort_desc": []
                  },
                  "creation_date_interval|creation_start_date|creation_end_date": "Last 180 Days",
                  "delivery_date_interval|delivery_start_date|delivery_end_date": "All",
                  "tag_purchase": null,
                  "currency_type": "Rupee",
                  "item_type": "Goods",
                  "goods_status": "All",
                  "invoice_status": "All",
                  "document_status": "All Sent",
                  "output": "display"
                  }
   const accessToken = await getTranzactAccessToken()
   console.log("AccessToken:", accessToken)
   const res = await fetch(url, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(body)
   })

   // console.log("Tranzact report response status:", await res.text())
   if (!res.ok) {
      const errorBody = await res.text()
      console.log("URL : ",url)
      console.log("AccessToken response ok : ",accessToken)

      throw new Error(`Failed to get response: ${res.status} ${res.statusText}\nBody: ${errorBody}`)
   }

   const data = await res.json()
   // console.log("Tranzact report data :", data)
   if (!data?.data?.results){
      throw new Error(`Results not found in response: ${JSON.stringify(data)}`)
   }

   return data.data.results
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
    createReturnReverseJob, getTranzactAccessToken, getPurchaseOrderRegisterReport,
}
