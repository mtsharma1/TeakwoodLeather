"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy, RefreshCw, CheckCircle, AlertCircle, Clock, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface ApiEndpoint {
  id: string
  name: string
  endpoint: string
}

interface JobStatus {
  id: string
  jobType: string
  status: "pending" | "processing" | "completed" | "failed"
  filePath: string | null
  progress: number
  message: string | null
  error: string | null
  startedAt: string
  updatedAt: string
  completedAt: string | null
}

interface RecentJobsI {
  jobType: string;
  filePath: string | null;
  message: string | null;
  status: string;
  updatedAt: Date;
  completedAt: Date | null;
}

export function SettingsUrl({ recentJobs }: { recentJobs: RecentJobsI[] }) {
  // Define the 5 different API endpoints
  const apiEndpoints: ApiEndpoint[] = useMemo(
    () => [
      { id: "monthly-report", name: "Monthly Report", endpoint: "/api/settings/refresh/monthly" },
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

  // Initialize URLs from recent jobs if available
  useEffect(() => {
    if (recentJobs && recentJobs.length > 0) {
      const initialUrls: Record<string, string> = { ...urls };
      
      recentJobs.forEach(job => {
        if (job.filePath) {
          const apiId = getApiIdFromJobType(job.jobType);
          if (apiId && !initialUrls[apiId]) {
            initialUrls[apiId] = job.filePath;
          }
        }
      });
      
      setUrls(initialUrls);
    }
  }, [recentJobs]);

  // Helper to convert jobType to apiId
  const getApiIdFromJobType = (jobType: string): string | null => {
    switch(jobType) {
      case "monthly": return "monthly-report";
      case "invoice": return "invoice-report";
      case "channel-report": return "channel-report";
      case "sku-imgs": return "sku-imgs";
      default: return null;
    }
  }

  // Helper to convert apiId to jobType
  const getJobTypeFromApiId = (apiId: string): string => {
    switch(apiId) {
      case "monthly-report": return "monthly";
      case "invoice-report": return "invoice";
      case "channel-report": return "channel-report";
      case "sku-imgs": return "sku-imgs";
      default: return apiId;
    }
  }

  // Get recent jobs for a specific endpoint
  const getRecentJobsForEndpoint = (apiId: string) => {
    const jobType = getJobTypeFromApiId(apiId);
    return recentJobs.filter(job => job.jobType === jobType);
  }

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

  // Status messages for each API
  const [statusMessages, setStatusMessages] = useState<Record<string, string>>(
    apiEndpoints.reduce((acc, api) => ({ ...acc, [api.id]: "" }), {}),
  )

  // Active jobs for each API
  const [activeJobs, setActiveJobs] = useState<Record<string, string | null>>(
    apiEndpoints.reduce((acc, api) => ({ ...acc, [api.id]: null }), {}),
  )

  // Effect to handle timers for long-running operations
  useEffect(() => {
    const intervals: Record<string, NodeJS.Timeout> = {}

    apiEndpoints.forEach((api) => {
      if (loadingStates[api.id]) {
        intervals[api.id] = setInterval(() => {
          setTimers((prev) => {
            const newTime = prev[api.id] + 1
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

  // Effect to poll job status
  useEffect(() => {
    const intervals: Record<string, NodeJS.Timeout> = {}

    apiEndpoints.forEach((api) => {
      const jobId = activeJobs[api.id]
      if (jobId && (statuses[api.id] === "loading")) {
        intervals[api.id] = setInterval(async () => {
          try {
            const apiId = api.id === "monthly-report" ? "monthly" : 
                           api.id === "invoice-report" ? "invoice" : 
                           api.id === "channel-report" ? "channel-report" : "sku-imgs"
            
            const response = await fetch(`/api/settings/job-status?jobType=${apiId}`)
            if (!response.ok) throw new Error("Failed to fetch job status")
            
            const data = await response.json()
            if (!data.success) throw new Error(data.message)
            
            const jobStatus: JobStatus = data.data

            // Update progress
            setProgress(prev => ({
              ...prev,
              [api.id]: jobStatus.progress
            }))

            // Update status message
            setStatusMessages(prev => ({
              ...prev,
              [api.id]: jobStatus.message || ""
            }))

            // Update URL if available
            if (jobStatus.filePath) {
              setUrls(prev => ({
                ...prev,
                [api.id]: jobStatus.filePath!
              }))
            }

            // Check if completed or failed
            if (jobStatus.status === "completed") {
              setLoadingStates(prev => ({
                ...prev,
                [api.id]: false
              }))
              setStatuses(prev => ({
                ...prev,
                [api.id]: "success"
              }))
              clearInterval(intervals[api.id])
              
              // Show success toast
              toast.success(`${api.name} refreshed successfully`, {
                duration: 3000,
                icon: <CheckCircle className="h-4 w-4 text-green-500" />,
              })
              
              // Reset status after a delay
              setTimeout(() => {
                setStatuses(prev => ({
                  ...prev,
                  [api.id]: "idle"
                }))
                setActiveJobs(prev => ({
                  ...prev,
                  [api.id]: null
                }))
              }, 3000)
            } else if (jobStatus.status === "failed") {
              setLoadingStates(prev => ({
                ...prev,
                [api.id]: false
              }))
              setStatuses(prev => ({
                ...prev,
                [api.id]: "error"
              }))
              clearInterval(intervals[api.id])
              
              // Show error toast
              toast.error(jobStatus.error || `Failed to refresh ${api.name}`, {
                duration: 5000,
                icon: <AlertCircle className="h-4 w-4 text-red-500" />,
              })
              
              // Reset status after a delay
              setTimeout(() => {
                setStatuses(prev => ({
                  ...prev,
                  [api.id]: "idle"
                }))
                setActiveJobs(prev => ({
                  ...prev,
                  [api.id]: null
                }))
              }, 3000)
            }

          } catch (error) {
            console.error("Error polling job status:", error)
          }
        }, 2000) // Poll every 2 seconds
      } else if (intervals[api.id]) {
        clearInterval(intervals[api.id])
      }
    })

    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval))
    }
  }, [activeJobs, statuses, apiEndpoints])

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
    setStatusMessages((prev) => ({ ...prev, [api.id]: "Starting job..." }))

    // Show initial toast
    const toastId = toast.loading(`Refreshing ${api.name}...`, {
      duration: 3000,
    })

    try {
      const response = await fetch(api.endpoint)
      const data = await response.json()

      if (response.ok) {
        // Update toast
        toast.success(`${api.name} job started`, {
          id: toastId,
          duration: 3000,
        })

        // Update the URL if provided
        if (data.filePath) {
          updateUrl(api.id, data.filePath)
        }

        // Set the active job ID for status polling
        if (data.jobId) {
          setActiveJobs((prev) => ({ ...prev, [api.id]: data.jobId }))
        }
      } else {
        throw new Error(data.message || `Failed to refresh ${api.name}`)
      }
    } catch (error) {
      setStatuses((prev) => ({ ...prev, [api.id]: "error" }))
      setLoadingStates((prev) => ({ ...prev, [api.id]: false }))

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
    }
  }

  // Helper function to get status message
  const getStatusMessage = (api: ApiEndpoint) => {
    if (statuses[api.id] === "loading") {
      if (statusMessages[api.id]) {
        return `${statusMessages[api.id]} (${timers[api.id]}s)`
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

  // Helper function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
      case "processing":
        return <Badge variant="outline" className="bg-blue-500 text-white hover:bg-blue-600">Processing</Badge>
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500 text-white hover:bg-yellow-600">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Helper function to format date
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd MMM yyyy HH:mm:ss")
  }

  return (
    <Card className="shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">URL Settings</CardTitle>
        <CardDescription>Refresh your endpoints - progress will be shown in real-time</CardDescription>
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
              />
            )}
            
            {/* Job History Section */}
            {getRecentJobsForEndpoint(api.id).length > 0 && (
              <Collapsible className="mt-2">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center text-xs text-muted-foreground hover:text-foreground w-full justify-between"
                  >
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Job History
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="space-y-2 text-xs">
                    {getRecentJobsForEndpoint(api.id).slice(0, 3).map((job, idx) => (
                      <div key={idx} className="border rounded-md p-2 bg-muted/40">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {renderStatusBadge(job.status)}
                          </div>
                          <div className="text-muted-foreground">
                            {formatDate(job.updatedAt)}
                          </div>
                        </div>
                        {job.message && (
                          <div className="mt-1 text-muted-foreground">
                            {job.message}
                          </div>
                        )}
                        {job.completedAt && (
                          <div className="mt-1 text-muted-foreground">
                            Completed: {formatDate(job.completedAt)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
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

