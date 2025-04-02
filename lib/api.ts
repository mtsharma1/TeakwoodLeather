import { unstable_noStore } from "next/cache";
import { CHANNEL_REPORT_API_BODY, ITEM_MASTER_DROPBOX_API_BODY, MONTHLY_REPORT_API_BODY } from "./api-utils"

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
         "Facility": "teakwoodindia",
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
         "Cookie": "unicommerce=app3"
      }
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
   const body = MONTHLY_REPORT_API_BODY
   return fetchWithAuth(url, { method: "POST", body: JSON.stringify(body) })
}

async function createChannelItemReportJob() {
   const url = `${BASE_URL}/services/rest/v1/export/job/create`
   const body = CHANNEL_REPORT_API_BODY
   return fetchWithAuth(url, { method: "POST", body: JSON.stringify(body) })
}

async function createItemMasterDropboxJob() {
   const url = `${BASE_URL}/services/rest/v1/export/job/create`
   const body = ITEM_MASTER_DROPBOX_API_BODY
   return fetchWithAuth(url, { method: "POST", body: JSON.stringify(body) })
}

async function getJobStatus(jobCode: string) {
   const url = `${BASE_URL}/services/rest/v1/export/job/status?_=${Date.now()}`
   const body = { jobCode }
   return fetchWithAuth(url, { method: "POST", body: JSON.stringify(body) })
}

export { createInvoiceJob, createMontlyReportJob, getJobStatus, getAccessToken, createChannelItemReportJob, createItemMasterDropboxJob }

