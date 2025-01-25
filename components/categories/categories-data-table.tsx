"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, Search, X } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { enhancedMultiSelectFilter, getUniqueColumnValues } from './data-table-filters'
import { CategoryData } from "./categories-cols"
// import CsvDownloader from 'react-csv-downloader';


const getBgColor = (columnId: string, isHeader: boolean = false): string => {
  if (columnId.startsWith('salesSizes_') || columnId === 'Sales Sizes' || columnId === 'totalSaleQty') {
    return isHeader ? 'bg-blue-100' : 'bg-blue-50';
  } else if (columnId.startsWith('availableInventorySize_') || columnId === 'Available Inventory' || columnId === 'availableInventorySizeTotal') {
    return isHeader ? 'bg-green-100' : 'bg-yellow-50';
  } else if (columnId.startsWith('openPurchaseSize_') || columnId === 'Open Purchase' || columnId === 'openPurchaseSizeTotal') {
    return isHeader ? 'bg-yellow-100' : 'bg-red-50';
  } else if (columnId.startsWith('orderQtySize_') || columnId === 'Order Qty' || columnId === 'orderQtySizeTotal') {
    return isHeader ? 'bg-yellow-100' : 'bg-orange-50';
  }
  return '';
};

export default function CategoryDataTable({
  data = [],
  columns = [],
  groupLength,
}: {
  data: CategoryData[]
  columns: ColumnDef<CategoryData>[]
  groupLength: number
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

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
    filterFns: {
      multiSelect: enhancedMultiSelectFilter,
    },
  })

  const handleFilterChange = React.useCallback((columnId: string, filterValue: string) => {
    setColumnFilters((prev) => {
      const columnFilterIndex = prev.findIndex((filter) => filter.id === columnId)
      if (columnFilterIndex !== -1) {
        const updatedFilters = [...prev]
        const currentValues = updatedFilters[columnFilterIndex].value as string[]
        updatedFilters[columnFilterIndex] = {
          id: columnId,
          value: [...currentValues, filterValue],
        }
        return updatedFilters
      } else {
        return [...prev, { id: columnId, value: [filterValue] }]
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
          value: currentValues.filter((value) => value !== filterValue),
        }
        return updatedFilters.filter((filter) => (filter.value as string[]).length > 0)
      }
      return prev
    })
  }, [])

  const groupedColumns = [
    { title: 'Product Info', span: 3, color: 'text-medium bg-gray-200' },
    { title: 'Sales Sizes', span: (groupLength + 1), color: 'text-medium bg-blue-100' },
    { title: 'Sales Info', span: 6, color: 'text-medium bg-green-100' },
    { title: 'Available Inventory', span: (groupLength + 1), color: 'text-medium bg-yellow-100' },
    { title: 'Open Purchase', span: (groupLength + 1), color: 'text-medium bg-red-100' },
    { title: 'Order Qty', span: (groupLength + 1), color: 'text-medium bg-orange-100' },
  ]

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
          {/* <CsvDownloader filename="AwbTransacs" datas={data} columns={table.getAllColumns().map(x => ({ id: x.id, displayName: x.id }))}>
            <Button size={'icon'}>
              <DownloadIcon size={18} />
            </Button>
          </CsvDownloader> */}
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
                  <p className="text-sm text-muted-foreground">
                    Select columns to filter the table
                  </p>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="grid gap-2">
                    {table.getAllColumns()
                      .filter((column) => column.getCanFilter())
                      .map((column) => {
                        const uniqueValues = getUniqueColumnValues(data, column.id)
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
                              <ScrollArea className="h-72 p-2">
                                {uniqueValues.map((value) => (
                                  <div key={value} className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={(column.getFilterValue() as string[])?.includes(value)}
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
        {/* Col visibility */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>

      {/* Active filters display */}
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
          ))
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <div className="relative w-full overflow-auto">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow>
                {groupedColumns.map((group, index) => (
                  <TableHead
                    key={index}
                    colSpan={group.span}
                    className={`text-center font-bold ${group.color}`}
                  >
                    {group.title}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                {table.getFlatHeaders().map((header, index) => (
                  <TableHead key={header.id} className={`font-bold text-gray-800 whitespace-nowrap ${index === 0 ? 'sticky left-0 z-20 bg-white' : ''} ${getBgColor(header.id)}`}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        className={`whitespace-nowrap ${index === 0 ? 'sticky left-0 z-20 bg-white' : ''} ${getBgColor(cell.column.id)}`}
                        key={cell.id}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

