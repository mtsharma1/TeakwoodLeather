export default function LoadingSkeleton() {
    return (
      <div className="w-full">
        {/* Overstock Header */}
  
        {/* Search and Controls */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 max-w-[220px]">
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex-1 max-w-[220px]">
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="ml-auto">
            <div className="h-10 w-[120px] bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
  
        {/* Table */}
        <div className="border rounded-lg">
          {/* Table Header */}
          <div className="grid grid-cols-9 gap-4 p-4 bg-gray-50 border-b">
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" /> {/* Sku Code */}
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" /> {/* Parent SKU */}
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" /> {/* Size */}
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" /> {/* Category Name */}
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" /> {/* Sub Category */}
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" /> {/* Sale Qty */}
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" /> {/* Sale Amount */}
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" /> {/* Vendor Name */}
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" /> {/* Static Grade */}
          </div>
  
          {/* Table Rows */}
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-9 gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50"
            >
              <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-8 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
  
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-500">
            <div className="h-5 w-44 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }
  
  