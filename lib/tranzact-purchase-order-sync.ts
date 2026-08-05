import { saveTranzactPurchaseOrderData } from "@/action/db_action"
import { getPurchaseOrderRegisterReport } from "@/lib/api"

type ProgressCallback = (progress: number, message: string) => Promise<void> | void

export async function syncTranzactPurchaseOrders(onProgress?: ProgressCallback) {
  await onProgress?.(10, "Fetching Tranzact purchase order report...")
  const results = await getPurchaseOrderRegisterReport()

  if (results.length === 0) {
    throw new Error("Tranzact returned no purchase order rows; existing data was preserved")
  }

  await onProgress?.(75, `Saving ${results.length} Tranzact purchase order rows...`)
  const saved = await saveTranzactPurchaseOrderData(results)

  if (saved.count !== results.length) {
    throw new Error(`Fetched ${results.length} rows but saved ${saved.count} rows`)
  }

  return {
    fetchedCount: results.length,
    savedCount: saved.count,
  }
}
