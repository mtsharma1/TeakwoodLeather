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
import { ExcelDownloader } from "../excel-downloader"
import { EditableRow } from "./editable-row"
import { List, AutoSizer } from "react-virtualized" // Import react-virtualized components

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
  data: { [key: string]: string | number }[]
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

  const dataWithIds = React.useMemo(() =>
    data.map((item, index) => ({
      ...item,
      id: (item.id ?? index).toString(),
    })),
    [data])

  const columns = React.useMemo(() => generateColumns(columnNames), [columnNames])

  const table = useReactTable({
    data: dataWithIds,
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

  const isEditing = ['stop', "understock"].includes(filename)

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
                                <div style={{ height: "200px" }}>
                                  <VirtualizedFilterList
                                    columnId={column.id}
                                    data={dataWithIds}
                                    activeFilters={activeFilters}
                                    handleFilterChange={handleFilterChange}
                                    removeFilter={removeFilter}
                                  />
                                </div>
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
          <ExcelDownloader
            data={dataWithIds}
            filename={filename}
          />
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
                    {isEditing && (
                      <TableHead className="w-[100px] text-ellipsis text-nowrap whitespace-nowrap">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, rowIndex) => {
                    const firstColumnId = table.getHeaderGroups()[0].headers[0].column.id
                    const isPinned = pinnedColumns.includes(firstColumnId)

                    const orderedColumnIds = table.getVisibleLeafColumns().map(col => col.id)

                    return (
                      <EditableRow
                        key={row.id}
                        row={row.original}
                        columns={orderedColumnIds}
                        isPinned={isPinned}
                        rowIndex={rowIndex}
                        isEditing={isEditing}
                      />
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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

// New component for virtualized filter list using react-virtualized
function VirtualizedFilterList({
  columnId,
  data,
  activeFilters,
  handleFilterChange,
  removeFilter,
}: {
  columnId: string
  data: { [key: string]: string | number }[]
  activeFilters: Record<string, string[]>
  handleFilterChange: (columnId: string, filterValue: string) => void
  removeFilter: (columnId: string, filterValue: string) => void
}) {
  // Get unique values for the column
  const uniqueValues = React.useMemo(
    () => Array.from(new Set(data.map((item) => String(item[columnId as keyof typeof item])))).sort(),
    [data, columnId]
  )

  // Row renderer for the List component
  const rowRenderer = ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
    const value = uniqueValues[index]
    return (
      <div key={key} style={{ ...style, padding: "4px 8px" }}>
        <div className="flex items-center space-x-2">
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
      </div>
    )
  }

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          rowCount={uniqueValues.length}
          rowHeight={32} // Adjust based on your item height
          rowRenderer={rowRenderer}
          overscanRowCount={5} // Number of rows to render outside the visible area
        />
      )}
    </AutoSizer>
  )
}

const generateColumns = (
  columnNames: string[],
): ColumnDef<{
  [key: string]: string | number
}>[] => {
  const dynamicColumns =
    columnNames
      .filter((colName) => colName.toLowerCase() !== "id").map((colName) => ({
        accessorKey: colName,
        header: () => <span className="w-64 text-gray-800 font-semibold">{colName.toLocaleUpperCase().replaceAll("_", " ")}</span>,
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