import { ColumnDef } from "@tanstack/react-table"
import { categorySizeMap } from "./data-table-filters"

export type CategoryData = {
    [key: string]: string | number | Record<string, number>,
    salesSizes: Record<string, number>
    totalSaleQty: number
    totalSaleAmount: number
    avgSellingPrice: number
    orderQty: number
    sets: number
    availableInventorySize: Record<string, number>
    availableInventorySizeTotal: number
    openPurchaseSize: Record<string, number>
    openPurchaseSizeTotal: number
    orderQtySize: Record<string, number>
    orderQtySizeTotal: number
    saleThrough: number
    vendorPrice: number
    vendorName: string
    totalPrice: number
    monthGrade: string
    skuCode: string
    categoryName: string
    subCategory: string
}

const createSizeColumns = (data: string[], accessorPrefix: keyof CategoryData): ColumnDef<CategoryData>[] =>
    data.map(size => ({
        id: `${accessorPrefix}_${size}`,
        header: size,
        accessorFn: (row) => (row[accessorPrefix] as Record<string, number>)[size] || 0,
        enableColumnFilter: true,
    }))

export const MensShoescolumns: ColumnDef<CategoryData>[] = [
    {
        accessorKey: "sku",
        header: "Sku Code",
        cell: ({ row }) => <div className="font-medium">{row.getValue("sku")}</div>,
    },
    {
        accessorKey: "category",
        header: "Category Name",
    },
    {
        accessorKey: "subCategory",
        header: "Sub Category",
    },
    ...createSizeColumns(categorySizeMap.mensshoes, "salesSizes"),
    {
        accessorKey: "totalSaleQty",
        header: "TOTAL",
    },
    {
        accessorKey: "totalSaleAmount",
        header: "30 DAYS SALE AMOUNT",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalSaleAmount"))
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)
        },
    },
    {
        accessorKey: "avgSellingPrice",
        header: "Avg Selling Price",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("avgSellingPrice"))
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)
        },
    },
    {
        accessorKey: "monthGrade",
        header: "Month Grade",
        cell: ({ row }) => {
            const grade: string = row.getValue("monthGrade")
            return (
                <div className={`font-medium ${grade === 'A' ? 'text-green-600' :
                    grade === 'B' ? 'text-yellow-600' :
                        'text-red-600'
                    }`}>
                    {grade}
                </div>
            )
        },
    },
    {
        accessorKey: "orderQty",
        header: "ORDER QTY",
    },
    {
        accessorKey: "sets",
        header: "SETS",
    },
    ...createSizeColumns(categorySizeMap.mensshoes, "availableInventorySize"),
    {
        accessorKey: "availableInventorySizeTotal",
        header: "Available Inventory Total",
    },
    ...createSizeColumns(categorySizeMap.mensshoes, "openPurchaseSize"),
    {
        accessorKey: "orderQtySizeTotal",
        header: "Order Qty Total",
    },
    {
        accessorKey: "saleThrough",
        header: "Sale Through",
    },
    {
        accessorKey: "vendorPrice",
        header: "Vendor Price",
    },
    {
        accessorKey: "vendorName",
        header: "Vendor Price",
    },
    {
        accessorKey: "totalPrice",
        header: "Total Price",
    },
]

export const WomensShoescolumns: ColumnDef<CategoryData>[] = [
    {
        accessorKey: "sku",
        header: "Sku Code",
        cell: ({ row }) => <div className="font-medium">{row.getValue("sku")}</div>,
    },
    {
        accessorKey: "category",
        header: "Category Name",
    },
    {
        accessorKey: "subCategory",
        header: "Sub Category",
    },
    ...createSizeColumns(categorySizeMap.womenshoes, "salesSizes"),
    {
        accessorKey: "totalSaleQty",
        header: "TOTAL",
    },
    {
        accessorKey: "totalSaleAmount",
        header: "30 DAYS SALE AMOUNT",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalSaleAmount"))
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)
        },
    },
    {
        accessorKey: "avgSellingPrice",
        header: "Avg Selling Price",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("avgSellingPrice"))
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)
        },
    },
    {
        accessorKey: "monthGrade",
        header: "Month Grade",
        cell: ({ row }) => {
            const grade: string = row.getValue("monthGrade")
            return (
                <div className={`font-medium ${grade === 'A' ? 'text-green-600' :
                    grade === 'B' ? 'text-yellow-600' :
                        'text-red-600'
                    }`}>
                    {grade}
                </div>
            )
        },
    },
    {
        accessorKey: "orderQty",
        header: "ORDER QTY",
    },
    {
        accessorKey: "sets",
        header: "SETS",
    },
    ...createSizeColumns(categorySizeMap.womenshoes, "availableInventorySize"),
    {
        accessorKey: "availableInventorySizeTotal",
        header: "Available Inventory Total",
    },
    ...createSizeColumns(categorySizeMap.womenshoes, "openPurchaseSize"),
    {
        accessorKey: "orderQtySizeTotal",
        header: "Order Qty Total",
    },
    {
        accessorKey: "saleThrough",
        header: "Sale Through",
    },
    {
        accessorKey: "vendorPrice",
        header: "Vendor Price",
    },
    {
        accessorKey: "vendorName",
        header: "Vendor Price",
    },
    {
        accessorKey: "totalPrice",
        header: "Total Price",
    },
]

export const KidsShoescolumns: ColumnDef<CategoryData>[] = [
    {
        accessorKey: "sku",
        header: "Sku Code",
        cell: ({ row }) => <div className="font-medium">{row.getValue("sku")}</div>,
    },
    {
        accessorKey: "category",
        header: "Category Name",
    },
    {
        accessorKey: "subCategory",
        header: "Sub Category",
    },
    ...createSizeColumns(categorySizeMap.kidsshoes, "salesSizes"),
    {
        accessorKey: "totalSaleQty",
        header: "TOTAL",
    },
    {
        accessorKey: "totalSaleAmount",
        header: "30 DAYS SALE AMOUNT",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalSaleAmount"))
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)
        },
    },
    {
        accessorKey: "avgSellingPrice",
        header: "Avg Selling Price",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("avgSellingPrice"))
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)
        },
    },
    {
        accessorKey: "monthGrade",
        header: "Month Grade",
        cell: ({ row }) => {
            const grade: string = row.getValue("monthGrade")
            return (
                <div className={`font-medium ${grade === 'A' ? 'text-green-600' :
                    grade === 'B' ? 'text-yellow-600' :
                        'text-red-600'
                    }`}>
                    {grade}
                </div>
            )
        },
    },
    {
        accessorKey: "orderQty",
        header: "ORDER QTY",
    },
    {
        accessorKey: "sets",
        header: "SETS",
    },
    ...createSizeColumns(categorySizeMap.kidsshoes, "availableInventorySize"),
    {
        accessorKey: "availableInventorySizeTotal",
        header: "Available Inventory Total",
    },
    ...createSizeColumns(categorySizeMap.kidsshoes, "openPurchaseSize"),
    {
        accessorKey: "orderQtySizeTotal",
        header: "Order Qty Total",
    },
    {
        accessorKey: "saleThrough",
        header: "Sale Through",
    },
    {
        accessorKey: "vendorPrice",
        header: "Vendor Price",
    },
    {
        accessorKey: "vendorName",
        header: "Vendor Price",
    },
    {
        accessorKey: "totalPrice",
        header: "Total Price",
    },
]

export const Jacketcolumns: ColumnDef<CategoryData>[] = [
    {
        accessorKey: "sku",
        header: "Sku Code",
        cell: ({ row }) => <div className="font-medium">{row.getValue("sku")}</div>,
    },
    {
        accessorKey: "category",
        header: "Category Name",
    },
    {
        accessorKey: "subCategory",
        header: "Sub Category",
    },
    ...createSizeColumns(categorySizeMap.leatherjackets, "salesSizes"),
    {
        accessorKey: "totalSaleQty",
        header: "TOTAL",
    },
    {
        accessorKey: "totalSaleAmount",
        header: "30 DAYS SALE AMOUNT",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalSaleAmount"))
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)
        },
    },
    {
        accessorKey: "avgSellingPrice",
        header: "Avg Selling Price",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("avgSellingPrice"))
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)
        },
    },
    {
        accessorKey: "monthGrade",
        header: "Month Grade",
        cell: ({ row }) => {
            const grade: string = row.getValue("monthGrade")
            return (
                <div className={`font-medium ${grade === 'A' ? 'text-green-600' :
                    grade === 'B' ? 'text-yellow-600' :
                        'text-red-600'
                    }`}>
                    {grade}
                </div>
            )
        },
    },
    {
        accessorKey: "orderQty",
        header: "ORDER QTY",
    },
    {
        accessorKey: "sets",
        header: "SETS",
    },
    ...createSizeColumns(categorySizeMap.leatherjackets, "availableInventorySize"),
    {
        accessorKey: "availableInventorySizeTotal",
        header: "Available Inventory Total",
    },
    ...createSizeColumns(categorySizeMap.leatherjackets, "openPurchaseSize"),
    {
        accessorKey: "orderQtySizeTotal",
        header: "Order Qty Total",
    },
    {
        accessorKey: "saleThrough",
        header: "Sale Through",
    },
    {
        accessorKey: "vendorPrice",
        header: "Vendor Price",
    },
    {
        accessorKey: "vendorName",
        header: "Vendor Price",
    },
    {
        accessorKey: "totalPrice",
        header: "Total Price",
    },
]

export const Beltcolumns: ColumnDef<CategoryData>[] = [
    {
        accessorKey: "sku",
        header: "Sku Code",
        cell: ({ row }) => <div className="font-medium">{row.getValue("sku")}</div>,
    },
    {
        accessorKey: "category",
        header: "Category Name",
    },
    {
        accessorKey: "subCategory",
        header: "Sub Category",
    },
    ...createSizeColumns(categorySizeMap.leathermencasualbelt, "salesSizes"),
    {
        accessorKey: "totalSaleQty",
        header: "TOTAL",
    },
    {
        accessorKey: "totalSaleAmount",
        header: "30 DAYS SALE AMOUNT",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalSaleAmount"))
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)
        },
    },
    {
        accessorKey: "avgSellingPrice",
        header: "Avg Selling Price",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("avgSellingPrice"))
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)
        },
    },
    {
        accessorKey: "monthGrade",
        header: "Month Grade",
        cell: ({ row }) => {
            const grade: string = row.getValue("monthGrade")
            return (
                <div className={`font-medium ${grade === 'A' ? 'text-green-600' :
                    grade === 'B' ? 'text-yellow-600' :
                        'text-red-600'
                    }`}>
                    {grade}
                </div>
            )
        },
    },
    {
        accessorKey: "orderQty",
        header: "ORDER QTY",
    },
    {
        accessorKey: "sets",
        header: "SETS",
    },
    ...createSizeColumns(categorySizeMap.leathermencasualbelt, "availableInventorySize"),
    {
        accessorKey: "availableInventorySizeTotal",
        header: "Available Inventory Total",
    },
    ...createSizeColumns(categorySizeMap.leathermencasualbelt, "openPurchaseSize"),
    {
        accessorKey: "orderQtySizeTotal",
        header: "Order Qty Total",
    },
    {
        accessorKey: "saleThrough",
        header: "Sale Through",
    },
    {
        accessorKey: "vendorPrice",
        header: "Vendor Price",
    },
    {
        accessorKey: "vendorName",
        header: "Vendor Price",
    },
    {
        accessorKey: "totalPrice",
        header: "Total Price",
    },
]

export const OtherColumns: ColumnDef<CategoryData>[] = [
    {
        accessorKey: "sku",
        header: "Sku Code",
        cell: ({ row }) => <div className="font-medium">{row.getValue("sku")}</div>,
    },
    {
        accessorKey: "category",
        header: "Category Name",
    },
    {
        accessorKey: "subCategory",
        header: "Sub Category",
    },
    ...createSizeColumns(categorySizeMap.othercategory, "salesSizes"),
    {
        accessorKey: "totalSaleQty",
        header: "TOTAL",
    },
    {
        accessorKey: "totalSaleAmount",
        header: "30 DAYS SALE AMOUNT",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalSaleAmount"))
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)
        },
    },
    {
        accessorKey: "avgSellingPrice",
        header: "Avg Selling Price",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("avgSellingPrice"))
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)
        },
    },
    {
        accessorKey: "monthGrade",
        header: "Month Grade",
        cell: ({ row }) => {
            const grade: string = row.getValue("monthGrade")
            return (
                <div className={`font-medium ${grade === 'A' ? 'text-green-600' :
                    grade === 'B' ? 'text-yellow-600' :
                        'text-red-600'
                    }`}>
                    {grade}
                </div>
            )
        },
    },
    {
        accessorKey: "orderQty",
        header: "ORDER QTY",
    },
    {
        accessorKey: "sets",
        header: "SETS",
    },
    ...createSizeColumns(categorySizeMap.othercategory, "availableInventorySize"),
    {
        accessorKey: "availableInventorySizeTotal",
        header: "Available Inventory Total",
    },
    ...createSizeColumns(categorySizeMap.othercategory, "openPurchaseSize"),
    {
        accessorKey: "orderQtySizeTotal",
        header: "Order Qty Total",
    },
    {
        accessorKey: "saleThrough",
        header: "Sale Through",
    },
    {
        accessorKey: "vendorPrice",
        header: "Vendor Price",
    },
    {
        accessorKey: "vendorName",
        header: "Vendor Price",
    },
    {
        accessorKey: "totalPrice",
        header: "Total Price",
    },
]

