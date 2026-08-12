import type { MonthDataItem } from "@/types/order"
import { fetchCSV, pollJobStatus } from "@/action/csv"
import { saveMonthlyDataOptimally } from "@/action/db_action"
import { transformData } from "@/lib/action-utils"
import { createMontlyReportJob } from "@/lib/api"

type ProgressCallback = (progress: number, message: string) => Promise<void> | void

export async function syncMonthlyReport(onProgress?: ProgressCallback) {
  await onProgress?.(10, "Creating monthly report export job...")
  const jobResponse = await createMontlyReportJob()

  if (!jobResponse?.successful || !jobResponse?.jobCode) {
    throw new Error(`Failed to create monthly export job: ${JSON.stringify(jobResponse)}`)
  }

  await onProgress?.(20, "Waiting for monthly export job to complete...")
  const result = await pollJobStatus(jobResponse.jobCode, 120, 2000)

  if (!result?.filePath) {
    throw new Error("Monthly export completed without a file path")
  }

  await onProgress?.(45, "Downloading and parsing monthly report CSV...")
  const rawData = await fetchCSV<MonthDataItem>(result.filePath)

  await onProgress?.(65, "Transforming monthly report data...")
  const transformedData = transformData(rawData)

  if (transformedData.length === 0) {
    throw new Error("Monthly report contained no rows; existing data was preserved")
  }

  await onProgress?.(80, `Saving ${transformedData.length} monthly report rows...`)
  const saved = await saveMonthlyDataOptimally(transformedData)

  if (saved.count !== transformedData.length) {
    throw new Error(`Monthly report transformed ${transformedData.length} rows but saved ${saved.count}`)
  }

  return {
    filePath: result.filePath,
    fetchedCount: rawData.length,
    savedCount: saved.count,
  }
}
