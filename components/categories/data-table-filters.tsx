import { Row } from "@tanstack/react-table"
import { CategoryData } from "./categories-cols"

export const categorySizeMap = {
  mensshoes: ['40', '41', '42', '43', '44', '45'],
  womenshoes: ["36", "37", "38", "39", "40", "41"],
  kidsshoes: ["18", "19", "20", "21", "22", "23", "24", "25"],
  leatherjackets: ["S", "M", "L", "XL", "XXL"],
  leathermencasualbelt: ["34", "36", "38", "40", "42", "44"],
  othercategory: ["S"],
};

export const enhancedMultiSelectFilter = (
  row: Row<CategoryData>,
  columnId: string,
  filterValues: string[]
): boolean => {
  if (!filterValues.length) return true

  const value = row.getValue(columnId)
  return filterValues.includes(String(value))
}

export const getUniqueColumnValues = (data: CategoryData[], columnId: string): string[] => {
  const values = new Set<string>()

  data.forEach(row => {
    let value;

    if (columnId.startsWith('salesSizes') ||
      columnId.startsWith('availableInventorySize') ||
      columnId.startsWith('openPurchaseSize')) {
      const size = columnId.split('_')[1]
      const category = columnId.split('_')[0]
      value = (row[category] as Record<string, number>)[size]
    } else {
      value = row[columnId]
    }

    if (value !== undefined && value !== null) {
      values.add(String(value))
    }
  })

  return Array.from(values).sort((a, b) => {
    const numA = Number(a)
    const numB = Number(b)
    return isNaN(numA) || isNaN(numB) ? a.localeCompare(b) : numA - numB
  })
}