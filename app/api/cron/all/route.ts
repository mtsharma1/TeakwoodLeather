import { NextResponse } from "next/server"

export const maxDuration = 300
export const dynamic = "force-dynamic"

type CronRunResult = {
  endpoint: string
  ok: boolean
  status?: number
  error?: string
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin

  const endpoints = [
    "/api/cron",
    "/api/cron/morning-cron",
    "/api/cron/return-courier",
    "/api/cron/return-reverse",
    "/api/cron/tranzact-purchase-order",
  ]

  const results = await Promise.all(
    endpoints.map(async (endpoint): Promise<CronRunResult> => {
      try {
        const res = await fetch(`${origin}${endpoint}`, {
          method: "GET",
          cache: "no-store",
        })

        return {
          endpoint,
          ok: res.ok,
          status: res.status,
        }
      } catch (error) {
        return {
          endpoint,
          ok: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    })
  )

  const allTriggered = results.every((x) => x.ok)

  return NextResponse.json(
    {
      success: allTriggered,
      message: allTriggered
        ? "All cron jobs triggered successfully"
        : "One or more cron jobs failed to trigger",
      triggeredAt: new Date().toISOString(),
      results,
    },
    { status: allTriggered ? 200 : 500 }
  )
}

