
// import { Skeleton } from "@/components/ui/skeleton"

// export default function MonthlyReportSkeleton() {
//     return (
//         <div className="p-8 space-y-8">
//             {/* Dashboard Title */}
//             <div className="space-y-2">
//                 <Skeleton className="h-8 w-32" />
//             </div>

//             {/* Top Row - 4 Metric Cards */}
//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//                 {[...Array(4)].map((_, i) => (
//                     <div key={i} className="p-6 space-y-4 rounded-lg border">
//                         <div className="flex items-center space-x-2">
//                             <Skeleton className="h-5 w-5" /> {/* Icon */}
//                             <Skeleton className="h-4 w-24" /> {/* Title */}
//                         </div>
//                         <div className="space-y-2">
//                             <Skeleton className="h-7 w-16" /> {/* Number */}
//                             <Skeleton className="h-4 w-28" /> {/* Subtitle */}
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Middle Row - 2 Metric Cards */}
//             <div className="grid gap-4 md:grid-cols-2">
//                 {[...Array(2)].map((_, i) => (
//                     <div key={i} className="p-6 space-y-4 rounded-lg border">
//                         <div className="flex items-center space-x-2">
//                             <Skeleton className="h-5 w-5" /> {/* Icon */}
//                             <Skeleton className="h-4 w-40" /> {/* Title */}
//                         </div>
//                         <div className="space-y-2">
//                             <Skeleton className="h-7 w-16" /> {/* Number */}
//                             <Skeleton className="h-4 w-32" /> {/* Subtitle */}
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Bottom Row - Charts */}
//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                 {/* Sales Analysis Card */}
//                 <div className="p-6 space-y-4 rounded-lg border">
//                     <div className="space-y-2">
//                         <Skeleton className="h-5 w-32" />
//                         <Skeleton className="h-4 w-40" />
//                     </div>
//                     <div className="space-y-2">
//                         {/* Bar Chart Skeleton */}
//                         <div className="flex items-end gap-2 h-40">
//                             <Skeleton className="w-12 h-32" />
//                             <Skeleton className="w-12 h-16" />
//                             <Skeleton className="w-12 h-12" />
//                             <Skeleton className="w-12 h-8" />
//                             <Skeleton className="w-12 h-10" />
//                             <Skeleton className="w-12 h-6" />
//                         </div>
//                         {/* X-axis Labels */}
//                         <div className="flex justify-between px-2">
//                             {["A", "B", "C", "D", "A+", "NEW"].map((label) => (
//                                 <Skeleton key={label} className="w-8 h-4" />
//                             ))}
//                         </div>
//                     </div>
//                     <div className="space-y-2">
//                         <Skeleton className="h-4 w-48" />
//                         <Skeleton className="h-4 w-56" />
//                     </div>
//                 </div>

//                 {/* Inventory Analysis Card */}
//                 <div className="p-6 space-y-4 rounded-lg border">
//                     <div className="space-y-2">
//                         <Skeleton className="h-5 w-36" />
//                         <Skeleton className="h-4 w-40" />
//                     </div>
//                     <div className="space-y-2">
//                         {/* Bar Chart Skeleton */}
//                         <div className="flex items-end gap-2 h-40">
//                             <Skeleton className="w-12 h-32" />
//                             <Skeleton className="w-12 h-14" />
//                             <Skeleton className="w-12 h-10" />
//                             <Skeleton className="w-12 h-12" />
//                             <Skeleton className="w-12 h-8" />
//                             <Skeleton className="w-12 h-6" />
//                         </div>
//                         {/* X-axis Labels */}
//                         <div className="flex justify-between px-2">
//                             {["A", "B", "C", "D", "A+", "NEW"].map((label) => (
//                                 <Skeleton key={label} className="w-8 h-4" />
//                             ))}
//                         </div>
//                     </div>
//                     <div className="space-y-2">
//                         <Skeleton className="h-4 w-48" />
//                         <Skeleton className="h-4 w-56" />
//                     </div>
//                 </div>

//                 {/* Pie Chart Card */}
//                 <div className="p-6 space-y-4 rounded-lg border">
//                     <div className="space-y-2">
//                         <Skeleton className="h-5 w-44" />
//                         <Skeleton className="h-4 w-32" />
//                     </div>
//                     <div className="flex items-center justify-center py-8">
//                         {/* Donut Chart Skeleton */}
//                         <div className="relative">
//                             <Skeleton className="w-48 h-48 rounded-full" />
//                             <div className="absolute inset-0 flex items-center justify-center">
//                                 <Skeleton className="w-24 h-24 rounded-full bg-background" />
//                             </div>
//                         </div>
//                     </div>
//                     <div className="space-y-2">
//                         <Skeleton className="h-4 w-48 mx-auto" />
//                         <Skeleton className="h-4 w-56 mx-auto" />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }



import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-[100px] mb-1" />
              <Skeleton className="h-4 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GraphSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function GraphSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[150px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  )
}

