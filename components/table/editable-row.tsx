'use client'

import { useState, useOptimistic, useTransition, useRef, useEffect } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Pencil, X } from "lucide-react"
import { toast } from "sonner"
import { usePathname } from "next/navigation"
import { UpdateMonthDataInput, updateMonthDataItem } from "@/action/user_action"

type MonthDataItemRow = {
  [key: string]: string | number
}

interface EditableRowProps {
  row: MonthDataItemRow
  columns: string[]
  isPinned: boolean
  rowIndex: number
}

export function EditableRow({ row, columns, isPinned, rowIndex }: EditableRowProps) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()
  const initialFocusRef = useRef<HTMLInputElement>(null)

  const [optimisticRow, updateOptimisticRow] = useOptimistic(
    row,
    (state, updates) => ({ ...state, ...(typeof updates === 'object' ? updates : {}) })
  )

  const [editedValues, setEditedValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editing && initialFocusRef.current) {
      initialFocusRef.current.focus()
    }
  }, [editing])

  const handleEdit = () => {
    setEditing(true)
    const initialValues: Record<string, string> = {}
    columns.forEach(col => {
      initialValues[col] = optimisticRow[col]?.toString() || ""
    })
    setEditedValues(initialValues)
  }

  const handleCancel = () => {
    setEditing(false)
    setEditedValues({})
  }

  const handleInputChange = (column: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [column]: value
    }))
  }

  const handleSave = () => {
    const updateData: UpdateMonthDataInput = {
      id: optimisticRow.id as string,
      ...Object.fromEntries(
        Object.entries(editedValues).filter(([col, value]) => {
          return value !== optimisticRow[col]?.toString()
        })
      )
    }

    if (Object.keys(updateData).length <= 1) {
      setEditing(false)
      return
    }

    updateOptimisticRow(editedValues)

    startTransition(async () => {
      const result = await updateMonthDataItem(updateData, pathname)

      if (result.success) {
        toast.success("Row updated successfully")
      } else {
        toast.error(result.error || "Failed to update row")
      }

      setEditing(false)
    })
  }

  return (
    <TableRow
      data-state={editing ? "editing" : ""}
      className={`
        ${rowIndex % 2 === 0 ? "bg-gray-50/50" : ""}
        ${editing ? "bg-blue-50/50" : ""}
        relative
      `}
    >
      {columns.map((column, cellIndex) => {
        const isFirst = cellIndex === 0
        const isLastColumn = column === columns[columns.length - 1]

        return (
          <TableCell
            key={`${optimisticRow.id}-${column}`}
            className={`
              min-w-[150px]
              truncate
              overflow-hidden
              px-4
              ${isFirst && isPinned ? "sticky left-0 -z-50 bg-blue-50" : ""}
              ${editing ? "py-1" : ""}
            `}
          >
            {editing && isLastColumn ? (
              <Input
                ref={cellIndex === 0 ? initialFocusRef : null}
                value={editedValues[column] || ""}
                onChange={(e) => handleInputChange(column, e.target.value)}
                className="h-8 w-full"
              />
            ) : (
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {optimisticRow[column]?.toString()}
              </div>
            )}
          </TableCell>
        )
      })}

      {/* Floating Edit Button */}
      <TableCell className="relative">
        <div className={`
          absolute right-4 top-1/2 -translate-y-1/2
          transition-opacity duration-200
          bg-white shadow-md rounded-lg
          opacity-100 hover:opacity-100
        `}>
          {editing ? (
            <div className="flex items-center space-x-1 p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                disabled={isPending}
                className="h-8 w-8 hover:bg-green-100"
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                disabled={isPending}
                className="h-8 w-8 hover:bg-red-100"
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              className="h-8 w-8 hover:bg-blue-100"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}