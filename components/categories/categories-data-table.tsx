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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, DownloadIcon, ImageIcon, PinIcon, Search, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { getUniqueColumnValues } from "./data-table-filters" // Removed enhancedMultiSelectFilter import
import type { CategoryData } from "./categories-cols"
import { ArrowUpDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../ui/pagination"
import streamSaver from 'streamsaver'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { ImageCarousel } from "../table/editable-row"
import { List, AutoSizer } from "react-virtualized"
import "react-virtualized/styles.css"

// Define enhancedMultiSelectFilter for exact matches
const enhancedMultiSelectFilter = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: { getValue: (colName: string) => any },
  columnId: string,
  filterValue: string[]
): boolean => {
  if (!filterValue || filterValue.length === 0) return true;
  const cellValue = String(row.getValue(columnId)); // Convert to string for exact match
  console.log(cellValue, filterValue)
  return filterValue.includes(cellValue);
};

const getBgColor = (columnId: string, isHeader: boolean = false): string => {
  if (columnId.startsWith('salesSizes_') || columnId === 'Sales Sizes' || columnId === 'totalSaleQty') {
    return isHeader ? 'bg-blue-100' : 'bg-blue-50';
  } else if (columnId.startsWith('availableInventorySize_') || columnId === 'Available Inventory' || columnId === 'availableInventorySizeTotal') {
    return isHeader ? 'bg-yellow-100' : 'bg-yellow-50';
  } else if (columnId.startsWith('openPurchaseSize_') || columnId === 'Open Purchase' || columnId === 'openPurchaseSizeTotal') {
    return isHeader ? 'bg-red-100' : 'bg-red-50';
  } else if (columnId.startsWith('orderQtySize_') || columnId === 'Order Qty' || columnId === 'orderQtySizeTotal') {
    return isHeader ? 'bg-orange-100' : 'bg-orange-50';
  }
  return '';
};

export default function CategoryDataTable({
  data = [],
  columns = [],
  groupLength,
  filename,
  filterRowHeight = 32,
}: {
  data: CategoryData[]
  columns: ColumnDef<CategoryData>[]
  groupLength: number
  filename: string
  filterRowHeight?: number
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pinnedColumns, setPinnedColumns] = React.useState<string[]>([])
  const [pageSize, setPageSize] = React.useState(20)

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
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
    pageCount: Math.ceil(data.length / pageSize),
    filterFns: {
      multiSelect: enhancedMultiSelectFilter,
    },
  })

  React.useEffect(() => {
    table.setPageSize(pageSize)
  }, [pageSize, table])

  const handleFilterChange = React.useCallback((columnId: string, filterValue: string) => {
    setColumnFilters((prev) => {
      const columnFilterIndex = prev.findIndex((filter) => filter.id === columnId)
      if (columnFilterIndex !== -1) {
        const updatedFilters = [...prev]
        const currentValues = updatedFilters[columnFilterIndex].value as string[]
        updatedFilters[columnFilterIndex] = {
          id: columnId,
          value: [...currentValues, String(filterValue)], // Ensure string
        }
        return updatedFilters
      } else {
        return [...prev, { id: columnId, value: [String(filterValue)] }]
      }
    })
  }, [])

  const removeFilter = React.useCallback((columnId: string, filterValue: string) => {
    setColumnFilters((prev) => {
      const columnFilterIndex = prev.findIndex((filter) => filter.id === columnId)
      if (columnFilterIndex !== -1) {
        const updatedFilters = [...prev]
        const currentValues = updatedFilters[columnFilterIndex].value as string[]
        updatedFilters[columnFilterIndex] = {
          id: columnId,
          value: currentValues.filter((value) => value !== String(filterValue)),
        }
        return updatedFilters.filter((filter) => (filter.value as string[]).length > 0)
      }
      return prev
    })
  }, [])

  const toggleColumnPin = React.useCallback((columnId: string) => {
    setPinnedColumns((prevPinnedColumns) => {
      if (prevPinnedColumns.includes(columnId)) {
        return prevPinnedColumns.filter((id) => id !== columnId)
      } else {
        return [...prevPinnedColumns, columnId]
      }
    })
  }, [])

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

  const groupedColumns = [
    { title: "Product Info", span: 3, color: "text-medium bg-gray-200" },
    { title: "Sales Sizes", span: groupLength + 1, color: "text-medium bg-blue-100" },
    { title: "Sales Info", span: 6, color: "text-medium bg-green-100" },
    { title: "Available Inventory", span: groupLength + 1, color: "text-medium bg-yellow-100" },
    { title: "Open Purchase", span: groupLength + 1, color: "text-medium bg-red-100" },
    { title: "Order Qty", span: groupLength + 1, color: "text-medium bg-orange-100" },
  ]

  const downloadCSV = async (selectedOnly: boolean = false) => {
    const fileStream = streamSaver.createWriteStream(`${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    const streamWriter = fileStream.getWriter();

    try {
      // Write headers
      const columns = table.getAllFlatColumns();
      const headers = columns.map(column => column.id).join(',') + '\n';
      await streamWriter.write(new TextEncoder().encode(headers));

      // Process rows in chunks
      const chunkSize = 1000;
      const rows = selectedOnly
        ? table.getFilteredRowModel().rows.filter(row => row.getIsSelected())
        : table.getFilteredRowModel().rows;

      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize).map(row => {
          return columns.map(column => {
            const value = row.getValue(column.id);

            // Handle special formatting for currency values
            if (['totalSaleAmount', 'avgSellingPrice', 'vendorPrice', 'totalPrice'].includes(column.id)) {
              return value ? Number(value).toFixed(2) : '0';
            }

            // Handle special formatting for size objects
            if (column.id.startsWith('salesSizes_') ||
              column.id.startsWith('availableInventorySize_') ||
              column.id.startsWith('openPurchaseSize_') ||
              column.id.startsWith('orderQtySize_')) {
              return value || '0';
            }

            // Handle grades
            if (column.id === 'staticGrade' || column.id === 'monthGrade') {
              return value || '';
            }

            // Escape and quote strings containing commas
            return typeof value === 'string' && value.includes(',')
              ? `"${value.replace(/"/g, '""')}"`
              : value ?? '';
          }).join(',');
        }).join('\n') + '\n';

        await streamWriter.write(new TextEncoder().encode(chunk));
      }
    } finally {
      await streamWriter.close();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
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
                        const displayName = column.id

                        return (
                          <Popover key={column.id}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                {displayName}
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
                                  activeFilters={columnFilters.reduce((acc, filter) => ({
                                    ...acc,
                                    [filter.id]: filter.value as string[],
                                  }), {})}
                                  handleFilterChange={handleFilterChange}
                                  removeFilter={removeFilter}
                                  rowHeight={filterRowHeight}
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
          <Button variant={'ghost'} size={'sm'}>Total Rows: {table.getFilteredRowModel().rows.length}</Button>
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
          <Button size={'icon'} onClick={() => downloadCSV()}>
            <DownloadIcon size={18} />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {columnFilters.map((filter) =>
          (filter.value as string[]).map((filterValue) => (
            <Badge key={`${filter.id}-${filterValue}`} variant="secondary">
              {filter.id}: {filterValue}
              <Button
                variant="ghost"
                onClick={() => removeFilter(filter.id, filterValue)}
                className="ml-1 h-auto p-0 text-base"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )),
        )}
      </div>

      <div className="rounded-lg border">
        <div className="relative w-full overflow-auto">
          <Table className="min-w-[1200px]">
            <TableHeader>
              {filename !== 'othercategory' && <TableRow>
                {groupedColumns.map((group, index) => (
                  <TableHead
                    key={index}
                    colSpan={group.span}
                    className={`text-center font-bold ${group.color}`}
                  >
                    {group.title}
                  </TableHead>
                ))}
              </TableRow>}
              <TableRow>
                {table.getFlatHeaders().map((header, index) => {
                  const isPinned = pinnedColumns.includes(header.column.id)
                  return (
                    <TableHead
                      key={header.id}
                      className={`font-bold text-gray-800 whitespace-nowrap ${index === 0 && isPinned ? "sticky left-0 z-20 bg-white" : ""
                        } ${getBgColor(header.id, true)}`}
                    >
                      <div className="flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-8 w-8 p-0"
                            onClick={() => header.column.toggleSorting()}
                          >
                            <ArrowUpDown className="h-4 w-4" />
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
                            <PinIcon
                              className={`h-4 w-4 ${isPinned ? "text-blue-500" : "text-gray-500"}`}
                            />
                          </Button>
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell, index) => {
                      const isPinned = pinnedColumns.includes(cell.column.id)
                      const isSkuColumn = cell.column.id.toLowerCase().includes('sku')

                      return (
                        <TableCell
                          className={`whitespace-nowrap ${index === 0 && isPinned ? "sticky left-0 z-10 bg-blue-50 shadow-lg" : ""} ${getBgColor(cell.column.id)}`}
                          key={cell.id}
                        >
                          {isSkuColumn ? (
                            <div className="flex items-center gap-2">
                              <span>{cell.getValue() as string}</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="p-1 rounded-full hover:bg-gray-100">
                                      <ImageIcon className="h-4 w-4 text-blue-500" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" sideOffset={5} className="p-0 border-0">
                                    <ImageCarousel sku={row.original.sku as string} />
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
    </div>
  )
}

// VirtualizedFilterList component for column filters
function VirtualizedFilterList({
  columnId,
  data,
  activeFilters,
  handleFilterChange,
  removeFilter,
  rowHeight = 32,
}: {
  columnId: string
  data: CategoryData[]
  activeFilters: Record<string, string[]>
  handleFilterChange: (columnId: string, filterValue: string) => void
  removeFilter: (columnId: string, filterValue: string) => void
  rowHeight?: number
}) {
  // Get unique values for the column
  const uniqueValues = React.useMemo(
    () => getUniqueColumnValues(data, columnId).map(String).sort(), // Ensure string values
    [data, columnId]
  )

  // Calculate dynamic height: min of (rowHeight * number of items, maxHeight)
  const maxHeight = 300 // Maximum height of the filter list
  const calculatedHeight = Math.min(uniqueValues.length * rowHeight, maxHeight)

  // Row renderer for react-virtualized List
  const rowRenderer = ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
    const value = uniqueValues[index]
    return (
      <div key={key} style={style} className="flex items-center space-x-2 px-2 py-1">
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
    <div style={{ height: `${calculatedHeight}px` }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            width={width} // Auto-adjust width to container
            height={height} // Auto-adjust height to container
            rowCount={uniqueValues.length} // Total number of items
            rowHeight={rowHeight} // Use prop for row height
            rowRenderer={rowRenderer} // Function to render each row
            overscanRowCount={5} // Render extra rows for smoother scrolling
          />
        )}
      </AutoSizer>
    </div>
  )
}