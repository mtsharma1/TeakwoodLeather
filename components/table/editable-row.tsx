"use client"

import { useState, useOptimistic, useTransition, useRef, useEffect } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Pencil, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { usePathname } from "next/navigation"
import { getProductImageBySKU, type UpdateMonthDataInput, updateMonthDataItem } from "@/action/user_action"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

type MonthDataItemRow = {
  [key: string]: string | number
}

interface EditableRowProps {
  row: MonthDataItemRow
  columns: string[]
  isPinned: boolean
  isEditing: boolean
  rowIndex: number
}

interface ImageCarouselProps {
  sku: string
}

export const ImageCarousel = ({ sku }: ImageCarouselProps) => {
  const [images, setImages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true)
      try {
        const rawImageUrls = (await getProductImageBySKU(sku))?.image_urls;
        const imageUrls = rawImageUrls && typeof rawImageUrls === "string" ? JSON.parse(rawImageUrls) : [];
        setImages(imageUrls)
      } catch (error) {
        console.error("Failed to load images:", error)
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [sku])

  useEffect(() => {
    // Auto-swipe every second
    const interval = setInterval(() => {
      if (images.length > 0) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [images])

  const handleImageClick = (imageUrl: string) => {
    window.open(imageUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="w-[300px] h-[200px] relative">
        <Skeleton className="w-full h-full absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return <div className="p-4 text-sm">No images available</div>
  }

  return (
    <div className="w-[300px] h-[200px] relative overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          onClick={() => handleImageClick(image)}
        >
          <img
            src={image || "/placeholder.svg"}
            alt={`${sku} image ${index + 1}`}
            className="w-full h-full object-contain p-2 bg-gray-200 cursor-pointer"
          />
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
            {index + 1}/{images.length}
          </div>
        </div>
      ))}
    </div>
  )
}

export function EditableRow({ row, columns, isPinned, rowIndex, isEditing }: EditableRowProps) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()
  const initialFocusRef = useRef<HTMLInputElement>(null)

  const [optimisticRow, updateOptimisticRow] = useOptimistic(row, (state, updates) => ({
    ...state,
    ...(typeof updates === "object" ? updates : {}),
  }))

  const [editedValues, setEditedValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editing && initialFocusRef.current) {
      initialFocusRef.current.focus()
    }
  }, [editing])

  const handleEdit = () => {
    setEditing(true)
    const initialValues: Record<string, string> = {}
    columns.forEach((col) => {
      initialValues[col] = optimisticRow[col]?.toString() || ""
    })
    setEditedValues(initialValues)
  }

  const handleCancel = () => {
    setEditing(false)
    setEditedValues({})
  }

  const handleInputChange = (column: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [column]: value,
    }))
  }

  const handleSave = () => {
    const updateData: UpdateMonthDataInput = {
      id: optimisticRow.id as string,
      ...Object.fromEntries(
        Object.entries(editedValues).filter(([col, value]) => {
          return value !== optimisticRow[col]?.toString()
        }),
      ),
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
        const isSkuColumn = column.toLowerCase().includes("sku")
        const cellValue = optimisticRow[column]?.toString() || ""

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
              <div className="overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-2">
                <span>{cellValue}</span>
                {isSkuColumn && !editing && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-1 rounded-full hover:bg-gray-100">
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={5} className="p-0 border-0">
                        <ImageCarousel sku={cellValue} />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </TableCell>
        )
      })}

      {/* Floating Edit Button */}
      {isEditing && (
        <TableCell className="relative">
          <div
            className={`
          absolute right-4 top-1/2 -translate-y-1/2
          transition-opacity duration-200
          bg-white shadow-md rounded-lg
          opacity-100 hover:opacity-100
        `}
          >
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
              <Button variant="ghost" size="icon" onClick={handleEdit} className="h-8 w-8 hover:bg-blue-100">
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  )
}

