"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ApiEndpoint {
  id: string
  name: string
  endpoint: string
}

export function SettingsUrl() {
  // Define the 5 different API endpoints
  const apiEndpoints: ApiEndpoint[] = useMemo(
    () => [
      { id: "montlhly-report", name: "Monthly Report", endpoint: "/api/settings/refresh/monthly" },
      { id: "invoice-report", name: "Invoice Report", endpoint: "/api/settings/refresh/invoice" },
      { id: "channel-report", name: "Channel Report", endpoint: "/api/settings/refresh/channel-report" },
      { id: "sku-imgs", name: "SKU Images", endpoint: "/api/settings/refresh/sku-imgs" },
    ],
    []
  )

  // Create state for each URL input
  const [urls, setUrls] = useState<Record<string, string>>(
    apiEndpoints.reduce((acc, api) => ({ ...acc, [api.id]: "" }), {}),
  )

  // Loading states for each API
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    apiEndpoints.reduce((acc, api) => ({ ...acc, [api.id]: false }), {}),
  )

  // Timer states for each API
  const [timers, setTimers] = useState<Record<string, number>>(
    apiEndpoints.reduce((acc, api) => ({ ...acc, [api.id]: 0 }), {}),
  )

  // Progress states for each API (0-100)
  const [progress, setProgress] = useState<Record<string, number>>(
    apiEndpoints.reduce((acc, api) => ({ ...acc, [api.id]: 0 }), {}),
  )

  // Status states for each API (idle, loading, success, error)
  const [statuses, setStatuses] = useState<Record<string, "idle" | "loading" | "success" | "error">>(
    apiEndpoints.reduce((acc, api) => ({ ...acc, [api.id]: "idle" }), {}),
  )

  // Effect to handle timers for long-running operations
  useEffect(() => {
    const intervals: Record<string, NodeJS.Timeout> = {}

    apiEndpoints.forEach((api) => {
      if (loadingStates[api.id]) {
        intervals[api.id] = setInterval(() => {
          setTimers((prev) => {
            const newTime = prev[api.id] + 1

            // Update progress based on time
            setProgress((prevProgress) => ({
              ...prevProgress,
              [api.id]: Math.min(99, newTime > 20 ? 90 + Math.floor(newTime / 10) : newTime * 4),
            }))

            // Show a toast for long-running operations
            if (newTime === 20) {
              toast.info(`${api.name} is taking longer than expected...`, {
                duration: 5000,
              })
            }

            return { ...prev, [api.id]: newTime }
          })
        }, 1000)
      } else if (intervals[api.id]) {
        clearInterval(intervals[api.id])
      }
    })

    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval))
    }
  }, [loadingStates, apiEndpoints])

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(urls[id])
    toast.success("URL copied to clipboard", {
      icon: <Copy className="h-4 w-4" />,
    })
  }

  const updateUrl = (id: string, value: string) => {
    setUrls((prev) => ({ ...prev, [id]: value }))
  }

  const refreshUrl = async (api: ApiEndpoint) => {
    // Reset states
    setTimers((prev) => ({ ...prev, [api.id]: 0 }))
    setProgress((prev) => ({ ...prev, [api.id]: 0 }))
    setLoadingStates((prev) => ({ ...prev, [api.id]: true }))
    setStatuses((prev) => ({ ...prev, [api.id]: "loading" }))

    // Show initial toast
    const toastId = toast.loading(`Refreshing ${api.name}...`, {
      duration: Number.POSITIVE_INFINITY,
    })

    try {
      const response = await fetch(api.endpoint)
      const data = await response.json()

      if (response.ok) {
        // Update progress to 100% on success
        setProgress((prev) => ({ ...prev, [api.id]: 100 }))
        setStatuses((prev) => ({ ...prev, [api.id]: "success" }))

        // Update toast
        toast.success(`${api.name} refreshed successfully`, {
          id: toastId,
          duration: 3000,
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        })

        // Update the URL if needed
        if (data.filePath) {
          updateUrl(api.id, data.filePath)
        }

        // Reset status after a delay
        setTimeout(() => {
          setStatuses((prev) => ({ ...prev, [api.id]: "idle" }))
        }, 3000)
      } else {
        throw new Error(data.message || `Failed to refresh ${api.name}`)
      }
    } catch (error) {
      setStatuses((prev) => ({ ...prev, [api.id]: "error" }))

      // Update toast
      toast.error(error instanceof Error ? error.message : `Failed to refresh ${api.name}`, {
        id: toastId,
        duration: 5000,
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      })

      // Reset status after a delay
      setTimeout(() => {
        setStatuses((prev) => ({ ...prev, [api.id]: "idle" }))
      }, 3000)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [api.id]: false }))
    }
  }

  // Helper function to get status message
  const getStatusMessage = (api: ApiEndpoint) => {
    if (statuses[api.id] === "loading") {
      if (timers[api.id] > 20) {
        return `Still working... (${timers[api.id]}s)`
      }
      return `Refreshing... (${timers[api.id]}s)`
    }
    if (statuses[api.id] === "success") {
      return "Successfully refreshed!"
    }
    if (statuses[api.id] === "error") {
      return "Failed to refresh"
    }
    return ""
  }

  return (
    <Card className="shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">URL Settings</CardTitle>
        <CardDescription>Refresh your endpoints - it may take longer than expected...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {apiEndpoints.map((api) => (
          <div
            key={api.id}
            className={cn(
              "space-y-3 rounded-lg p-4 transition-all duration-300",
              statuses[api.id] === "loading" && "bg-blue-50 dark:bg-blue-950/20",
              statuses[api.id] === "success" && "bg-green-50 dark:bg-green-950/20",
              statuses[api.id] === "error" && "bg-red-50 dark:bg-red-950/20",
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{api.name}</h3>
              <span
                className={cn(
                  "text-xs",
                  statuses[api.id] === "loading" && "text-blue-600 dark:text-blue-400",
                  statuses[api.id] === "success" && "text-green-600 dark:text-green-400",
                  statuses[api.id] === "error" && "text-red-600 dark:text-red-400",
                )}
              >
                {getStatusMessage(api)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  value={urls[api.id]}
                  disabled
                  onChange={(e) => updateUrl(api.id, e.target.value)}
                  placeholder={`Enter ${api.name} URL`}
                  className={cn(
                    "pr-10 transition-all duration-300",
                    statuses[api.id] === "success" && "border-green-300 dark:border-green-700",
                    statuses[api.id] === "error" && "border-red-300 dark:border-red-700",
                  )}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => copyToClipboard(api.id)}
                  disabled={!urls[api.id]}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy URL</span>
                </Button>
              </div>
              <Button
                onClick={() => refreshUrl(api)}
                disabled={loadingStates[api.id]}
                variant="outline"
                className={cn(
                  "transition-all duration-300 relative overflow-hidden",
                  loadingStates[api.id] && "bg-blue-100 dark:bg-blue-900/30",
                  statuses[api.id] === "success" && "bg-green-100 dark:bg-green-900/30",
                  statuses[api.id] === "error" && "bg-red-100 dark:bg-red-900/30",
                )}
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4 mr-2 transition-all duration-300",
                    loadingStates[api.id] && "animate-spin text-blue-600 dark:text-blue-400",
                  )}
                />
                {loadingStates[api.id] ? "Refreshing" : "Refresh"}
              </Button>
            </div>

            {(loadingStates[api.id] || statuses[api.id] !== "idle") && (
              <Progress
                value={progress[api.id]}
                className={cn(
                  "h-1 transition-all duration-300",
                  statuses[api.id] === "loading" && "bg-blue-100 dark:bg-blue-900/30",
                  statuses[api.id] === "success" && "bg-green-100 dark:bg-green-900/30",
                  statuses[api.id] === "error" && "bg-red-100 dark:bg-red-900/30",
                )}
                // indicatorClassName={cn(
                //   statuses[api.id] === "loading" && "bg-blue-600 dark:bg-blue-400",
                //   statuses[api.id] === "success" && "bg-green-600 dark:bg-green-400",
                //   statuses[api.id] === "error" && "bg-red-600 dark:bg-red-400",
                // )}
              />
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground flex justify-between items-center border-t p-4">
        <span>Click refresh to update the corresponding routes</span>
        {Object.values(loadingStates).some((state) => state) && (
          <span className="text-blue-600 dark:text-blue-400 animate-pulse">Operations in progress...</span>
        )}
      </CardFooter>
    </Card>
  )
}

