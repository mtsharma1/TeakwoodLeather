"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy, RefreshCw, CheckCircle, AlertCircle, Clock, ChevronDown, Database, FileText, FolderSync, ImageIcon, RefreshCcwDot, ScanSearch } from "lucide-react"
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

type EndpointFilter = "all" | "in-progress" | "completed" | "failed"

export function SettingsUrl({ recentJobs }: { recentJobs: RecentJobsI[] }) {
  // Define the 5 different API endpoints
  const apiEndpoints: ApiEndpoint[] = useMemo(
    () => [
      { id: "monthly-report", name: "Monthly Report", endpoint: "/api/settings/refresh/monthly" },
      { id: "invoice-report", name: "Invoice Report", endpoint: "/api/settings/refresh/invoice" },
      // { id: "return-invoice", name: "Return Invoice", endpoint: "/api/settings/refresh/return-invoice" },
      { id: "return-courier", name: "Return Courier", endpoint: "/api/settings/refresh/return-courier" },
      { id: "return-reverse", name: "Return Reverse", endpoint: "/api/settings/refresh/return-reverse" },
      { id: "channel-report", name: "Channel Report", endpoint: "/api/settings/refresh/channel-report" },
      { id: "sku-imgs", name: "SKU Images", endpoint: "/api/settings/refresh/sku-imgs" },
    ],
    []
  )

  // Create state for each URL input
  const [urls, setUrls] = useState<Record<string, string>>(
    apiEndpoints.reduce((acc, api) => ({ ...acc, [api.id]: "" }), {}),
  )
  const [recentJobsState, setRecentJobsState] = useState<RecentJobsI[]>(recentJobs)

  useEffect(() => {
    setRecentJobsState(recentJobs)
  }, [recentJobs])

  // Initialize URLs from recent jobs if available
  useEffect(() => {
    if (recentJobsState && recentJobsState.length > 0) {
      const initialUrls: Record<string, string> = { ...urls };
      
      recentJobsState.forEach(job => {
        if (job.filePath) {
          const apiId = getApiIdFromJobType(job.jobType);
          if (apiId && !initialUrls[apiId]) {
            initialUrls[apiId] = job.filePath;
          }
        }
      });
      
      setUrls(initialUrls);
    }
  }, [recentJobsState]);

  // Helper to convert jobType to apiId
  const getApiIdFromJobType = (jobType: string): string | null => {
    switch(jobType) {
      case "monthly": return "monthly-report";
      case "invoice": return "invoice-report";
      case "return-invoice": return "return-invoice";
      case "return-courier": return "return-courier";
      case "return-reverse": return "return-reverse";
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
      case "return-invoice": return "return-invoice";
      case "return-courier": return "return-courier";
      case "return-reverse": return "return-reverse";
      case "channel-report": return "channel-report";
      case "sku-imgs": return "sku-imgs";
      default: return apiId;
    }
  }

  // Get recent jobs for a specific endpoint
  const getRecentJobsForEndpoint = (apiId: string) => {
    const jobType = getJobTypeFromApiId(apiId);
    return recentJobsState.filter(job => job.jobType === jobType);
  }

  const upsertRecentJob = (job: RecentJobsI) => {
    setRecentJobsState((prev) => {
      const key = `${job.jobType}-${new Date(job.updatedAt).getTime()}-${job.status}`
      const filtered = prev.filter((item) => {
        const itemKey = `${item.jobType}-${new Date(item.updatedAt).getTime()}-${item.status}`
        return itemKey !== key
      })

      return [job, ...filtered].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    })
  }

  const getLatestJobStatusForEndpoint = (apiId: string): string | null => {
    const jobs = getRecentJobsForEndpoint(apiId)
    if (jobs.length === 0) return null

    const latestJob = [...jobs].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0]

    return latestJob.status
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
  const [statusFilter, setStatusFilter] = useState<EndpointFilter>("all")

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
                           api.id === "return-invoice" ? "return-invoice" :
                           api.id === "return-courier" ? "return-courier" :
                           api.id === "return-reverse" ? "return-reverse" :
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
              upsertRecentJob({
                jobType: jobStatus.jobType,
                filePath: jobStatus.filePath,
                message: jobStatus.message,
                status: jobStatus.status,
                updatedAt: new Date(jobStatus.updatedAt),
                completedAt: jobStatus.completedAt ? new Date(jobStatus.completedAt) : null,
              })

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
              upsertRecentJob({
                jobType: jobStatus.jobType,
                filePath: jobStatus.filePath,
                message: jobStatus.error || jobStatus.message,
                status: jobStatus.status,
                updatedAt: new Date(jobStatus.updatedAt),
                completedAt: jobStatus.completedAt ? new Date(jobStatus.completedAt) : null,
              })

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
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Completed</Badge>
      case "processing":
        return <Badge variant="outline" className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500">Processing</Badge>
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getEndpointIcon = (id: string) => {
    switch (id) {
      case "monthly-report":
        return Database
      case "invoice-report":
        return FileText
      case "return-courier":
        return RefreshCcwDot
      case "return-reverse":
        return FolderSync
      case "channel-report":
        return ScanSearch
      case "sku-imgs":
        return ImageIcon
      default:
        return FileText
    }
  }

  const getEndpointFilterStatus = (apiId: string): EndpointFilter => {
    if (loadingStates[apiId] || statuses[apiId] === "loading") return "in-progress"
    if (statuses[apiId] === "success") return "completed"
    if (statuses[apiId] === "error") return "failed"

    const latestStatus = getLatestJobStatusForEndpoint(apiId)
    if (latestStatus === "completed") return "completed"
    if (latestStatus === "failed") return "failed"
    if (latestStatus === "processing" || latestStatus === "pending") return "in-progress"

    return "in-progress"
  }

  const filteredEndpoints =
    statusFilter === "all"
      ? apiEndpoints
      : apiEndpoints.filter((api) => getEndpointFilterStatus(api.id) === statusFilter)
  const filterCounts = {
    "all": apiEndpoints.length,
    "in-progress": apiEndpoints.filter((api) => getEndpointFilterStatus(api.id) === "in-progress").length,
    "completed": apiEndpoints.filter((api) => getEndpointFilterStatus(api.id) === "completed").length,
    "failed": apiEndpoints.filter((api) => getEndpointFilterStatus(api.id) === "failed").length,
  }

  // Helper function to format date
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd MMM yyyy HH:mm:ss")
  }

  return (
    <Card className="rounded-2xl border border-[#dde4ef] bg-[#f9fbff] shadow-none transition-all duration-300">
      <CardHeader className="border-b border-[#e1e8f3] bg-white rounded-t-2xl">
        <CardTitle className="text-lg md:text-xl font-semibold tracking-[0.03em] text-[#344157]">Apps</CardTitle>
        <CardDescription className="text-[#6c778b]">
          Refresh endpoint connectors and monitor progress in real-time.
        </CardDescription>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === "all"
                ? "border-[#87a8e7] bg-[#eaf1ff] text-[#2f4d85]"
                : "border-[#d9e1ee] bg-white text-[#4d5a72] hover:bg-[#f3f7ff]"
            )}
          >
            All ({filterCounts["all"]})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("in-progress")}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === "in-progress"
                ? "border-[#87a8e7] bg-[#eaf1ff] text-[#2f4d85]"
                : "border-[#d9e1ee] bg-white text-[#4d5a72] hover:bg-[#f3f7ff]"
            )}
          >
            In-Progress ({filterCounts["in-progress"]})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("completed")}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === "completed"
                ? "border-[#79c492] bg-[#e8f8ee] text-[#2c8f52]"
                : "border-[#d9e1ee] bg-white text-[#4d5a72] hover:bg-[#f3f7ff]"
            )}
          >
            Completed ({filterCounts["completed"]})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("failed")}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === "failed"
                ? "border-[#e3a0a0] bg-[#fff1f1] text-[#c24d4d]"
                : "border-[#d9e1ee] bg-white text-[#4d5a72] hover:bg-[#f3f7ff]"
            )}
          >
            Failed ({filterCounts["failed"]})
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {filteredEndpoints.map((api) => (
          <div
            key={api.id}
            className={cn(
              "space-y-3 rounded-xl border p-4 transition-all duration-300 bg-white shadow-sm",
              statuses[api.id] === "idle" && "border-[#d8e0ec]",
              statuses[api.id] === "loading" && "border-[#89a8e8] bg-[#eef4ff]",
              statuses[api.id] === "success" && "border-[#79c492] bg-[#effaf3]",
              statuses[api.id] === "error" && "border-[#e3a0a0] bg-[#fff2f2]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#dbe3ef] bg-[#f4f7fc] text-[#425372]">
                  {(() => {
                    const EndpointIcon = getEndpointIcon(api.id)
                    return <EndpointIcon className="h-4 w-4" />
                  })()}
                </div>
                <h3 className="text-sm md:text-[15px] font-semibold tracking-[0.02em] text-[#344157]">{api.name}</h3>
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  statuses[api.id] === "loading" && "text-[#3567c8]",
                  statuses[api.id] === "success" && "text-[#2c8f52]",
                  statuses[api.id] === "error" && "text-[#c24d4d]",
                  statuses[api.id] === "idle" && "text-[#8a93a5]",
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
                    "pr-10 h-11 border-[#d6deea] bg-white text-[#4d5870] placeholder:text-[#99a3b6] transition-all duration-300 focus-visible:ring-[#4f7ddb]/25",
                    statuses[api.id] === "success" && "border-[#79c492]",
                    statuses[api.id] === "error" && "border-[#e3a0a0]",
                  )}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full text-[#70809d] hover:text-[#2f7ae5] hover:bg-[#eaf1ff]"
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
                  "h-11 min-w-[140px] rounded-full border-[#c7d3e8] bg-white text-[#344157] font-medium transition-all duration-300 relative overflow-hidden hover:bg-[#eaf1ff] hover:border-[#7fa2e7]",
                  loadingStates[api.id] && "bg-[#e7f0ff] text-[#3567c8] border-[#89a8e8]",
                  statuses[api.id] === "success" && "bg-[#e8f8ee] text-[#2c8f52] border-[#79c492]",
                  statuses[api.id] === "error" && "bg-[#fff1f1] text-[#c24d4d] border-[#e3a0a0]",
                )}
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4 mr-2 transition-all duration-300",
                    loadingStates[api.id] && "animate-spin text-[#3567c8]",
                  )}
                />
                {loadingStates[api.id] ? "Refreshing" : "Refresh"}
              </Button>
            </div>

            {(loadingStates[api.id] || statuses[api.id] !== "idle") && (
              <Progress
                value={progress[api.id]}
                className={cn(
                  "h-1.5 transition-all duration-300",
                  statuses[api.id] === "loading" && "bg-[#dfeaff]",
                  statuses[api.id] === "success" && "bg-[#dff4e6]",
                  statuses[api.id] === "error" && "bg-[#ffe2e2]",
                )}
              />
            )}
            
            {/* Job History Section */}
            <Collapsible className="mt-2">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center text-xs text-[#7b8597] hover:text-[#334154] hover:bg-[#edf3ff] w-full justify-between rounded-lg"
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
                  {getRecentJobsForEndpoint(api.id).length === 0 && (
                    <div className="border border-[#d8e0ec] rounded-lg p-2 bg-[#f8fafe] text-[#8a94a7]">
                      No history yet.
                    </div>
                  )}
                  {getRecentJobsForEndpoint(api.id).slice(0, 3).map((job, idx) => (
                    <div key={idx} className="border border-[#d8e0ec] rounded-lg p-2 bg-[#f8fafe]">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {renderStatusBadge(job.status)}
                        </div>
                        <div className="text-[#8a94a7]">
                          {formatDate(job.updatedAt)}
                        </div>
                      </div>
                      {job.message && (
                        <div className="mt-1 text-[#6d7890]">
                          {job.message}
                        </div>
                      )}
                      {job.completedAt && (
                        <div className="mt-1 text-[#8a94a7]">
                          Completed: {formatDate(job.completedAt)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
        {filteredEndpoints.length === 0 && (
          <div className="rounded-xl border border-[#d8e0ec] bg-white p-5 text-sm text-[#7d8798]">
            No endpoints found for the selected filter.
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-[#6f7b92] flex justify-between items-center border-t border-[#d8e0ec] p-4 bg-[#fafcff] rounded-b-2xl">
        <span>Click refresh to update the corresponding routes</span>
        {Object.values(loadingStates).some((state) => state) && (
          <span className="text-[#3567c8] animate-pulse">Operations in progress...</span>
        )}
      </CardFooter>
    </Card>
  )
}

