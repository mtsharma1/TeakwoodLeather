import { unstable_noStore } from "next/cache"
import { CHANNEL_REPORT_API_BODY, getInventorySnapshotApiBody, ITEM_MASTER_DROPBOX_API_BODY, MONTHLY_REPORT_API_BODY, RETURN_INVOICE_API_BODY } from "./api-utils"
import type { TranzactPurchaseOrderReport } from "@/types/order"

const BASE_URL = "https://teakwoodindia.unicommerce.com"
const TRANZACT_BASE_URL = "https://be.letstranzact.com/main/login/password-login/"
const TRANZACT_REPORTS_URL = "https://reporting.letstranzact.com/get_reports"
const TRANZACT_REPORT_URL = "https://reporting.letstranzact.com/generate_report"
const TRANZACT_PURCHASE_ORDER_REPORT_TYPE = "purchase.po_rfq_indent"
const TRANZACT_PURCHASE_ORDER_REPORT_NAME = "Purchase Order Register (Item-wise)"

let accessTokenCache: { token: string; expiresAt: number } | null = null
let accessTokenRequest: Promise<string> | null = null

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
   if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 60_000) {
      return accessTokenCache.token
   }

   if (accessTokenRequest) {
      return accessTokenRequest
   }

   accessTokenRequest = (async () => {
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

      let expiresAt = Date.now() + 4 * 60_000
      try {
         const payload = JSON.parse(Buffer.from(data.access_token.split(".")[1], "base64url").toString("utf8"))
         if (typeof payload.exp === "number") {
            expiresAt = payload.exp * 1000
         }
      } catch {
         // Tokens without a JWT expiry use the conservative fallback above.
      }

      accessTokenCache = { token: data.access_token, expiresAt }
      return data.access_token
   })()

   try {
      return await accessTokenRequest
   } finally {
      accessTokenRequest = null
   }
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
   return fetchWithAuth(url, { method: "POST", body: JSON.stringify(body) })
}

async function createInventorySnapshotJob() {
   const url = `${BASE_URL}/services/rest/v1/export/job/create`
   return fetchWithAuth(url, { method: "POST", body: JSON.stringify(getInventorySnapshotApiBody()) })
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
   if (!data?.data?.access_token) {
      throw new Error(`Access token not found in response: ${JSON.stringify(data)}`)
   }
   return data.data.access_token
}

type TranzactReportDefinition = {
   id?: string
   name?: string
   type?: string
}

async function getTranzactPurchaseOrderReportId(accessToken: string) {
   const res = await fetch(TRANZACT_REPORTS_URL, {
      headers: {
         "Authorization": `Bearer ${accessToken}`,
      },
   })

   if (!res.ok) {
      const errorBody = await res.text()
      throw new Error(`Failed to get Tranzact report definitions: ${res.status} ${res.statusText}\nBody: ${errorBody}`)
   }

   const data = await res.json()
   const reports: TranzactReportDefinition[] = Array.isArray(data?.data) ? data.data : []
   const report = reports.find((item) => item.name === TRANZACT_PURCHASE_ORDER_REPORT_NAME)
      ?? reports.find((item) => (
         item.type === TRANZACT_PURCHASE_ORDER_REPORT_TYPE
         && item.name?.toLowerCase().includes("purchase order register")
         && item.name?.toLowerCase().includes("item-wise")
      ))

   if (!report?.id) {
      throw new Error(`Tranzact item-wise Purchase Order Register report was not found in ${reports.length} available report definitions`)
   }

   return report.id
}


async function getPurchaseOrderRegisterReport(): Promise<TranzactPurchaseOrderReport[]> {

   console.log("Fetching Tranzact Purchase Order Register Report...")
   const url = `${TRANZACT_REPORT_URL}`
   const accessToken = await getTranzactAccessToken()
   const reportId = await getTranzactPurchaseOrderReportId(accessToken)
    const body = {
                  "selected_columns": [],
                  "grouped_data": false,
                  "selected_group_columns": [],
                  "initial_request": true,
                  "numeric_search_prefixes": {},
                  "report": {"id": reportId},
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
   const pageSize = body.pagination.items_per_page

   const fetchPage = async (page: number) => {
      let res: Response | null = null

      for (let attempt = 1; attempt <= 3; attempt += 1) {
         res = await fetch(url, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({
               ...body,
               pagination: { ...body.pagination, page },
            })
         })

         if (res.ok) break

         const errorBody = await res.text()
         if (res.status < 500 || attempt === 3) {
            throw new Error(`Failed to get response: ${res.status} ${res.statusText}\nBody: ${errorBody}`)
         }

         await new Promise((resolve) => setTimeout(resolve, attempt * 500))
      }

      if (!res?.ok) throw new Error("Failed to get Tranzact report response")

      const data = await res.json()
      const pageResults = data?.data?.results
      if (!Array.isArray(pageResults)) {
         throw new Error(`Results not found in response: ${JSON.stringify(data)}`)
      }

      return {
         rows: pageResults as TranzactPurchaseOrderReport[],
         totalItems: Number(data?.data?.total_items),
      }
   }

   const firstPage = await fetchPage(1)
   const pageCount = Number.isFinite(firstPage.totalItems)
      ? Math.max(1, Math.ceil(firstPage.totalItems / pageSize))
      : 1

   if (pageCount === 1) {
      return firstPage.rows
   }

   const remainingPages = await Promise.all(
      Array.from({ length: pageCount - 1 }, (_, index) => fetchPage(index + 2))
   )

   return [firstPage, ...remainingPages].flatMap((page) => page.rows)
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
    createReturnReverseJob, createInventorySnapshotJob, getTranzactAccessToken, getPurchaseOrderRegisterReport,
}
