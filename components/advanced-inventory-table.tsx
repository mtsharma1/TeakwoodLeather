"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, Search, X, DownloadIcon, ArrowUpDownIcon, PinIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import CsvDownloader from "react-csv-downloader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination"

const multiSelectFilter = (row: { getValue: (colName: string) => string }, columnId: string, filterValue: string[]) => {
  if (!filterValue.length) return true
  const cellValue = row.getValue(columnId)
  return filterValue.includes(String(cellValue))
}

export default function AdvancedInventoryTable({
  data = [],
  columnNames = [],
  filename,
}: {
  data: { [key: string]: string }[]
  columnNames?: string[]
  filename: string
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const [columnOrder, setColumnOrder] = React.useState<string[]>([])
  const [pageSize, setPageSize] = React.useState(20)
  const [pinnedColumns, setPinnedColumns] = React.useState<string[]>([])

  const columns = React.useMemo(() => generateColumns(columnNames), [columnNames])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnOrder,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    pageCount: Math.ceil(data.length / pageSize),
    filterFns: {
      multiSelect: multiSelectFilter,
    },
    getRowCanExpand: () => true,
  })

  React.useEffect(() => {
    setColumnOrder(table.getAllLeafColumns().map((d) => d.id))
  }, [table])

  React.useEffect(() => {
    table.setPageSize(pageSize)
  }, [pageSize, table])

  const handleFilterChange = (columnId: string, filterValue: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [columnId]: [...(prev[columnId] || []), filterValue],
    }))

    const column = table.getColumn(columnId)
    if (column) {
      const currentFilterValue = column.getFilterValue() as string[]
      column.setFilterValue([...(currentFilterValue || []), filterValue])
    }
  }

  const removeFilter = (columnId: string, filterValue: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [columnId]: prev[columnId].filter((value) => value !== filterValue),
    }))

    const column = table.getColumn(columnId)
    if (column) {
      const currentFilterValue = column.getFilterValue() as string[]
      column.setFilterValue(currentFilterValue.filter((value) => value !== filterValue))
    }
  }

  const toggleColumnPin = (columnId: string) => {
    setPinnedColumns((prevPinnedColumns) => {
      if (prevPinnedColumns.includes(columnId)) {
        return prevPinnedColumns.filter((id) => id !== columnId)
      } else {
        return [...prevPinnedColumns, columnId]
      }
    })
  }

  React.useEffect(() => {
    const newColumnOrder = [
      ...pinnedColumns,
      ...table
        .getAllLeafColumns()
        .filter((column) => !pinnedColumns.includes(column.id))
        .map((column) => column.id),
    ]
    table.setColumnOrder(newColumnOrder)
  }, [pinnedColumns, table])

  return (
    <div className="space-y-4">
      <div className="lg:flex items-center justify-between">
        <div className="flex items-center space-x-2 p-1">
          <Input
            placeholder="Filter all columns..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Search className="mr-2 h-4 w-4" />
                Search Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px]">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Search Columns</h4>
                  <p className="text-sm text-muted-foreground">Select columns to filter the table</p>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="grid gap-2">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanFilter() || column.id === "skuCode")
                      .map((column) => {
                        return (
                          <Popover key={column.id}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                {column.id}
                                <ChevronDown className="ml-auto h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="end">
                              <ScrollArea className="h-72 p-2">
                                <Input
                                  placeholder={`Search ${column.id}...`}
                                  value={(column.getFilterValue() as string) ?? ""}
                                  onChange={(event) => column.setFilterValue(event.target.value)}
                                  className="max-w-sm mb-2"
                                />
                                {Array.from(
                                  new Set(data.map((item) => String(item[column.id as keyof typeof item]))),
                                ).map((value) => (
                                  <div key={value} className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={activeFilters[column.id]?.includes(value)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          handleFilterChange(column.id, value)
                                        } else {
                                          removeFilter(column.id, value)
                                        }
                                      }}
                                    />
                                    <label className="text-sm">{value}</label>
                                  </div>
                                ))}
                              </ScrollArea>
                            </PopoverContent>
                          </Popover>
                        )
                      })}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2 justify-center mt-2 lg:mt-0 items-center text-center text-sm text-muted-foreground">
          <Button variant={"ghost"} size={"sm"}>
            Total Rows: {table.getFilteredRowModel().rows.length}
          </Button>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[20, 40, 60, 80, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CsvDownloader filename={filename} datas={data} columns={columnNames.map((x) => ({ id: x, displayName: x }))}>
            <Button size={"icon"}>
              <DownloadIcon size={18} />
            </Button>
          </CsvDownloader>
        </div>
      </div>
      {Object.entries(activeFilters).map(([columnId, filters]) =>
        filters.map((filter) => (
          <Badge key={`${columnId}-${filter}`} variant="secondary" className="mr-2">
            {columnId}: {filter}
            <Button
              variant="ghost"
              onClick={() => removeFilter(columnId, filter)}
              className="ml-1 h-auto p-0 text-base"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )),
      )}
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto" style={{ height: "calc(100vh - 300px)" }}>
          <div className="w-full min-w-[1200px]">
            <div className="sticky top-0 z-10 w-full">
              <div className="bg-white shadow-sm">
                {table.getHeaderGroups().map((headerGroup) => (
                  <div key={headerGroup.id} className="flex">
                    {headerGroup.headers.map((header, index) => {
                      const isPinned = pinnedColumns.includes(header.column.id)
                      return (
                        <div
                          key={header.id}
                          colSpan={header.colSpan}
                          className={`
                            ${isPinned ? "sticky left-0 z-20 bg-blue-50 shadow-lg" : "bg-white"} 
                            p-2 min-w-[150px] max-w-[265px] flex-1 text-left align-middle font-medium text-muted-foreground
                          `}
                          style={index === 0 && isPinned ? { position: "sticky", left: 0 } : {}}
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className="flex items-center justify-between"
                              onClick={() => header.column.toggleSorting()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              <div className="flex items-center">
                                {header.column.getCanSort() && (
                                  <Button variant="ghost" size="icon">
                                    <ArrowUpDownIcon className="h-4 w-4" />
                                  </Button>
                                )}
                                {index === 0 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleColumnPin(header.column.id)
                                    }}
                                  >
                                    <PinIcon className={`h-4 w-4 ${isPinned ? "text-blue-500" : "text-gray-500"}`} />
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, rowIndex) => (
                  <div
                    key={row.id}
                    className={`flex ${rowIndex % 2 === 0 ? "bg-gray-50" : ""} ${
                      row.getIsSelected() ? "bg-blue-100" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => {
                      const isPinned =
                        pinnedColumns.includes(table.getHeaderGroups()[0].headers[0].column.id) && cellIndex === 0
                      return (
                        <div
                          key={cell.id}
                          className={`
                            p-2 min-w-[150px] max-w-[265px] flex-1 overflow-hidden
                            ${isPinned ? "sticky left-0 z-10 bg-blue-50 shadow-lg" : ""}
                          `}
                        >
                          <div className="truncate">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                        </div>
                      )
                    })}
                  </div>
                ))
              ) : (
                <div className="text-center p-4">No results.</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                table.previousPage()
              }}
              aria-disabled={!table.getCanPreviousPage()}
              className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {table.getPageCount() > 0 && (
            <>
              {/* First Page */}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    table.setPageIndex(0)
                  }}
                  isActive={table.getState().pagination.pageIndex === 0}
                >
                  1
                </PaginationLink>
              </PaginationItem>

              {/* Show ellipsis if there are many pages before current */}
              {table.getState().pagination.pageIndex > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Current page and surrounding pages */}
              {table.getState().pagination.pageIndex > 1 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      table.setPageIndex(table.getState().pagination.pageIndex - 1)
                    }}
                  >
                    {table.getState().pagination.pageIndex}
                  </PaginationLink>
                </PaginationItem>
              )}

              {table.getState().pagination.pageIndex > 0 &&
                table.getState().pagination.pageIndex < table.getPageCount() - 1 && (
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        table.setPageIndex(table.getState().pagination.pageIndex)
                      }}
                      isActive={true}
                    >
                      {table.getState().pagination.pageIndex + 1}
                    </PaginationLink>
                  </PaginationItem>
                )}

              {table.getState().pagination.pageIndex < table.getPageCount() - 2 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      table.setPageIndex(table.getState().pagination.pageIndex + 1)
                    }}
                  >
                    {table.getState().pagination.pageIndex + 2}
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Show ellipsis if there are many pages after current */}
              {table.getState().pagination.pageIndex < table.getPageCount() - 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Last Page */}
              {table.getPageCount() > 1 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      table.setPageIndex(table.getPageCount() - 1)
                    }}
                    isActive={table.getState().pagination.pageIndex === table.getPageCount() - 1}
                  >
                    {table.getPageCount()}
                  </PaginationLink>
                </PaginationItem>
              )}
            </>
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                table.nextPage()
              }}
              aria-disabled={!table.getCanNextPage()}
              className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export const generateColumns = (
  columnNames: string[],
): ColumnDef<{
  [key: string]: string
}>[] => {
  const dynamicColumns =
    columnNames?.map((colName) => ({
      accessorKey: colName,
      header: () => <span className="w-64 text-gray-800 font-semibold">{colName.toLocaleUpperCase()}</span>,
      cell: ({ row }: { row: { getValue: (colName: string) => string } }) => {
        const value = row.getValue(colName)
        return (
          <div className="capitalize">
            <span>{value}</span>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: true,
      filterFn: multiSelectFilter,
    })) || []
  return dynamicColumns
}

