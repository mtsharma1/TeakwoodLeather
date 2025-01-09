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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, Search, X, DownloadIcon } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import CsvDownloader from 'react-csv-downloader';


const multiSelectFilter = (
  row:  { getValue: (colName: string) => string  },
  columnId: string,
  filterValue: string[]
) => {
  if (!filterValue.length) return true
  const cellValue = row.getValue(columnId)
  return filterValue.includes(String(cellValue))
}

// const DraggableTableHeader = ({ header, table }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
//     id: header.id,
//   })

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   }

//   return (
//     <TableHead
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       className={`
//         cursor-move
//         ${header.column.id === "select" || header.column.id === "skuCode" || header.column.id === "expander" ? "sticky left-0 z-10" : ""}
//         `}
//     >
//       <div className="flex items-center">
//         <GripVertical className="mr-2 h-4 w-4" {...listeners} />
//         {flexRender(header.column.columnDef.header, header.getContext())}
//       </div>
//     </TableHead>
//   )
// }

export default function AdvancedInventoryTable({
  data = [],
  columnNames = [],
}: {
  data: { [key: string]: string }[],
  columnNames: string[]
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  // const [selectedColumn, setSelectedColumn] = React.useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const [columnOrder, setColumnOrder] = React.useState<string[]>([])


  const columns = generateColumns(columnNames);

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
    filterFns: {
      multiSelect: multiSelectFilter,
    },
    getRowCanExpand: () => true,
  })

  React.useEffect(() => {
    setColumnOrder(table.getAllLeafColumns().map(d => d.id))
  }, [table])

  // const sensors = useSensors(
  //   useSensor(PointerSensor),
  //   useSensor(KeyboardSensor, {
  //     coordinateGetter: sortableKeyboardCoordinates,
  //   })
  // )

  // const handleDragEnd = (event: DragEndEvent) => {
  //   const { active, over } = event
  //   if (active.id !== over?.id) {
  //     setColumnOrder((prev) => {
  //       const oldIndex = prev.indexOf(active.id as string)
  //       const newIndex = prev.indexOf(over?.id as string)
  //       return arrayMove(prev, oldIndex, newIndex)
  //     })
  //   }
  // }

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
          <CsvDownloader filename="AwbTransacs" datas={data} columns={columnNames.map(x => ({ id: x, displayName: x }))}>
            <Button size={'icon'}>
              <DownloadIcon size={18} />
            </Button>
          </CsvDownloader>
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
                    {table.getAllColumns().filter((column) => column.getCanFilter() || column.id === "skuCode").map((column) => {
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
                              {Array.from(new Set(data.map((item) => String(item[column.id as keyof typeof item])))).map((value) => (
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
        <DropdownMenu>
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
        </DropdownMenu>
      </div>
      {Object.entries(activeFilters).map(([columnId, filters]) => (
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
        ))
      ))}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          {/* <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          > */}
          <Table className="min-w-full">
            {/* <TableHeader>
                <TableRow>
                  <SortableContext
                    items={columnOrder}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getHeaderGroups().map((headerGroup) => (
                      headerGroup.headers.map((header) => (
                        <DraggableTableHeader key={header.id} header={header} table={table} />
                      ))
                    ))}
                  </SortableContext>
                </TableRow>
              </TableHeader> */}
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}
                        className="min-w-[150px] max-w-[200px] text-ellipsis text-nowrap whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, rowIndex) => (
                  <React.Fragment key={row.id}>
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      className={`
                          ${rowIndex % 2 === 0 ? "bg-gray-50" : ""}
                          ${row.getIsSelected() ? "bg-blue-100" : ""}
                        `}
                    >
                      {/* ${selectedColumn === cell.column.id ? "bg-opacity-80 ring-1 ring-inset ring-primary" : ""} */}
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={` 
                              ${cell.column.id === "select" || cell.column.id === "skuCode" || cell.column.id === "expander" ? "sticky left-0 z-10" : ""}
                            `}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow>
                        <TableCell colSpan={row.getVisibleCells().length}>
                          {/* ExpandedRowContent will go here */}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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
          {/* </DndContext> */}
        </div>
      </div>
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


export const generateColumns = (columnNames: string[]): ColumnDef<{
  [key: string]: string;
}>[] => {
  const dynamicColumns = columnNames?.map((colName) => ({
    accessorKey: colName,
    header: () => <span className="w-64">{colName}</span>,
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
  })) || [];
  return dynamicColumns;
};

