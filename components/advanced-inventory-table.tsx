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
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, Search, X, ArrowUpDownIcon, PinIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ExcelDownloader } from "./excel-downloader"
import { cn } from "@/lib/utils"
import { List } from "react-virtualized" // Import react-virtualized List
import "react-virtualized/styles.css" // Import react-virtualized styles

const multiSelectFilter = (row: { getValue: (colName: string) => string }, columnId: string, filterValue: string[]) => {
  if (!filterValue.length) return true
  const cellValue = row.getValue(columnId)
  return filterValue.includes(String(cellValue))
}

// ... (rest of your existing imports and code)

export default function AdvancedInventoryTable({
  data = [],
  columnNames = [],
  filename,
  pageSizeParam = 20,
  showTools = true,
  totalData = {}
}: {
  data: { [key: string]: string }[]
  columnNames?: string[]
  filename?: string
  pageSizeParam?: number
  showTools?: boolean
  totalData?: { [key: string]: string }
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const [columnOrder, setColumnOrder] = React.useState<string[]>([])
  const [pageSize, setPageSize] = React.useState(pageSizeParam)
  const [pinnedColumns, setPinnedColumns] = React.useState<string[]>([])

  const columns = React.useMemo(() => generateColumns(columnNames, showTools), [columnNames, showTools])

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
      {showTools && (
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
                        .filter((column) => column.getCanFilter())
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
                                <div className="p-2">
                                  <Input
                                    placeholder={`Search ${column.id}...`}
                                    value={(column.getFilterValue() as string) ?? ""}
                                    onChange={(event) => column.setFilterValue(event.target.value)}
                                    className="mb-2"
                                  />
                                  <VirtualizedFilterList
                                    columnId={column.id}
                                    data={data}
                                    activeFilters={activeFilters}
                                    handleFilterChange={handleFilterChange}
                                    removeFilter={removeFilter}
                                  />
                                </div>
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
            <Button variant="ghost" size="sm">
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
            {filename && <ExcelDownloader
              data={data}
              filename={filename}
            />}
          </div>
        </div>
      )}

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
        <div className="relative">
          <div className="max-h-[800px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-50 bg-white">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header, index) => {
                      const isPinned = pinnedColumns.includes(header.column.id)

                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className={`
                            ${index === 0 && isPinned ? "sticky top-0 left-0 bg-blue-50 shadow-lg" : ""}
                            min-w-[150px]
                            text-ellipsis
                            text-nowrap
                            whitespace-nowrap
                          `}
                        >
                          {header.isPlaceholder ? null : (
                            <div>
                              <div
                                className="flex items-center cursor-pointer"
                                onClick={() => header.column.toggleSorting()}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
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
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, rowIndex) => {
                    const firstColumnId = table.getHeaderGroups()[0].headers[0].column.id
                    const isPinned = pinnedColumns.includes(firstColumnId)

                    return (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className={`
                          ${rowIndex % 2 === 0 ? "bg-gray-50" : ""}
                          ${row.getIsSelected() ? "bg-blue-100" : ""}
                        `}
                      >
                        {row.getVisibleCells().map((cell, cellIndex) => (
                          <TableCell
                            key={cell.id}
                            className={`
                              min-w-[150px]
                              truncate
                              overflow-hidden
                              px-4
                              ${cellIndex === 0 && isPinned ? "sticky left-0 -z-50 bg-blue-50 shadow-lg" : ""}
                            `}
                          >
                            <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                {
                  totalData && Object.keys(totalData).length > 0 && (
                    <TableRow>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {columns.map((column: any) => {
                        const totalValue = totalData[column.accessorKey as keyof typeof totalData]
                        return (
                          <TableCell key={column.id} className="font-semibold text-gray-800">
                            {totalValue}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                }
              </TableFooter>
            </Table>
          </div>
        </div>
      </div>

      {showTools && (
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

                {table.getState().pagination.pageIndex > 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

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

                {table.getState().pagination.pageIndex < table.getPageCount() - 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

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
      )}
    </div>
  )
}

// New VirtualizedFilterList component
function VirtualizedFilterList({
  columnId,
  data,
  activeFilters,
  handleFilterChange,
  removeFilter,
}: {
  columnId: string
  data: { [key: string]: string }[]
  activeFilters: Record<string, string[]>
  handleFilterChange: (columnId: string, filterValue: string) => void
  removeFilter: (columnId: string, filterValue: string) => void
}) {
  // Get unique values for the column
  const uniqueValues = React.useMemo(
    () => Array.from(new Set(data.map((item) => String(item[columnId as keyof typeof item])))).sort(),
    [data, columnId]
  )

  // Row renderer for react-virtualized List
  const rowRenderer = ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
    const value = uniqueValues[index]
    return (
      <div key={key} style={style} className="flex items-center space-x-2 px-2 py-1 whitespace-nowrap text-ellipsis "> 
        <Checkbox
          checked={activeFilters[columnId]?.includes(value)}
          onCheckedChange={(checked) => {
            if (checked) {
              handleFilterChange(columnId, value)
            } else {
              removeFilter(columnId, value)
            }
          }}
        />
        <label className="text-sm">{value}</label>
      </div>
    )
  }

  return (
    <div className="h-[200px]">
      <List
        width={180} // Width of the list (adjust based on PopoverContent width)
        height={200} // Height of the list (adjust based on available space)
        rowCount={uniqueValues.length} // Total number of items
        rowHeight={32} // Height of each row (adjust based on your design)
        rowRenderer={rowRenderer} // Function to render each row
      />
    </div>
  )
}

const generateColumns = (
  columnNames: string[],
  showTools: boolean,
): ColumnDef<{
  [key: string]: string | number
}>[] => {
  const dynamicColumns =
    columnNames
      .filter((colName) => colName.toLowerCase() !== "id")
      .map((colName) => ({
        accessorKey: colName,
        header: () => (
          <span className={cn(`text-gray-800 font-semibold`, showTools && "w-64")}>
            {colName.toLocaleUpperCase().replaceAll("_", " ")}
          </span>
        ),
        cell: ({ row }: { row: { getValue: (colName: string) => string | number } }) => {
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