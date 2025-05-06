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
        accessorKey: "staticGrade",
        header: "Static Grade",
        cell: ({ row }) => {
            const grade: string = row.getValue("staticGrade")
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
        header: "Total",
    },
    ...createSizeColumns(categorySizeMap.mensshoes, "openPurchaseSize"),
    {
        accessorKey: "openPurchaseSizeTotal",
        header: "Total",
    },
    ...createSizeColumns(categorySizeMap.mensshoes, "orderQtySize"),
    {
        accessorKey: "orderQtySizeTotal",
        header: "Total",
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
        accessorKey: "totalPrice",
        header: "Total Price",
    },
    {
        accessorKey: "vendorName",
        header: "Vendor Name",
    },
    {
        accessorKey: "ros",
        header: "ROS",
    },
    ...createSizeColumns(categorySizeMap.mensshoes, "sku_"),
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
        accessorKey: "staticGrade",
        header: "Static Grade",
        cell: ({ row }) => {
            const grade: string = row.getValue("staticGrade")
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
        accessorKey: "openPurchaseSizeTotal",
        header: "Total",
    },
    ...createSizeColumns(categorySizeMap.womenshoes, "orderQtySize"),
    {
        accessorKey: "orderQtySizeTotal",
        header: "Total",
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
        accessorKey: "totalPrice",
        header: "Total Price",
    },
    {
        accessorKey: "vendorName",
        header: "Vendor Name",
    },
    {
        accessorKey: "ros",
        header: "ROS",
    },
    ...createSizeColumns(categorySizeMap.womenshoes, "sku_"),
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
        accessorKey: "staticGrade",
        header: "Static Grade",
        cell: ({ row }) => {
            const grade: string = row.getValue("staticGrade")
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
        accessorKey: "openPurchaseSizeTotal",
        header: "Total",
    },
    ...createSizeColumns(categorySizeMap.kidsshoes, "orderQtySize"),
    {
        accessorKey: "orderQtySizeTotal",
        header: "Total",
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
        accessorKey: "totalPrice",
        header: "Total Price",
    },
    {
        accessorKey: "vendorName",
        header: "Vendor Name",
    },

    {
        accessorKey: "ros",
        header: "ROS",
    },
    ...createSizeColumns(categorySizeMap.kidsshoes, "sku_"),

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
        accessorKey: "staticGrade",
        header: "Static Grade",
        cell: ({ row }) => {
            const grade: string = row.getValue("staticGrade")
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
        accessorKey: "openPurchaseSizeTotal",
        header: "Total",
    },
    ...createSizeColumns(categorySizeMap.leatherjackets, "orderQtySize"),
    {
        accessorKey: "orderQtySizeTotal",
        header: "Total",
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
        accessorKey: "totalPrice",
        header: "Total Price",
    },
    {
        accessorKey: "vendorName",
        header: "Vendor Name",
    },
    {
        accessorKey: "ros",
        header: "ROS",
    },
    ...createSizeColumns(categorySizeMap.leatherjackets, "sku_"),

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
        accessorKey: "staticGrade",
        header: "Static Grade",
        cell: ({ row }) => {
            const grade: string = row.getValue("staticGrade")
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
        accessorKey: "openPurchaseSizeTotal",
        header: "Total",
    },
    ...createSizeColumns(categorySizeMap.leathermencasualbelt, "orderQtySize"),
    {
        accessorKey: "orderQtySizeTotal",
        header: "Total",
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
        accessorKey: "totalPrice",
        header: "Total Price",
    },
    {
        accessorKey: "vendorName",
        header: "Vendor Name",
    },
    {
        accessorKey: "ros",
        header: "ROS",
    },
    ...createSizeColumns(categorySizeMap.leathermencasualbelt, "sku_"),

]

// export const OtherColumns: ColumnDef<CategoryData>[] = [
//     {
//         id: "skuCode",
//         accessorKey: "Sku Code",
//         header: "SKU Code",
//         cell: ({ row }) => <div className="font-medium">{row.getValue("skuCode")}</div>,
//     },
//     {
//         id: "newSkuCode",
//         accessorKey: "New SKU Code",
//         header: "New SKU Code",
//     },
//     {
//         id: "categoryName",
//         accessorKey: "Category Name",
//         header: "Category",
//     },
//     {
//         id: "subCategory",
//         accessorKey: "Sub Category",
//         header: "Sub Category",
//     },
//     {
//         id: "size",
//         accessorKey: "Size",
//         header: "Size",
//     },
//     {
//         id: "availableInventory",
//         accessorKey: "Available Inventory",
//         header: "Available Inventory",
//     },
//     {
//         id: "avgSellingPrice",
//         accessorKey: "Avg Selling Price",
//         header: "Avg Selling Price",
//         cell: ({ row }) => {
//             const amount = parseFloat(row.getValue("avgSellingPrice"))
//             return new Intl.NumberFormat("en-IN", {
//                 style: "currency",
//                 currency: "INR",
//             }).format(amount)
//         },
//     },
//     {
//         id: "staticGrade",
//         accessorKey: "Static Grade",
//         header: "Static Grade",
//         cell: ({ row }) => {
//             const grade: string = row.getValue("staticGrade")
//             return (
//                 <div className={`font-medium ${
//                     grade === 'A' ? 'text-green-600' :
//                     grade === 'B' ? 'text-yellow-600' :
//                     'text-red-600'
//                 }`}>
//                     {grade}
//                 </div>
//             )
//         },
//     },
//     {
//         id: "monthGrade",
//         accessorKey: "Month Grade",
//         header: "Month Grade",
//         cell: ({ row }) => {
//             const grade: string = row.getValue("monthGrade")
//             return (
//                 <div className={`font-medium ${
//                     grade === 'A' ? 'text-green-600' :
//                     grade === 'B' ? 'text-yellow-600' :
//                     'text-red-600'
//                 }`}>
//                     {grade}
//                 </div>
//             )
//         },
//     },
//     {
//         id: "orderQty",
//         accessorKey: "Order Qty",
//         header: "Order Qty",
//     },
//     {
//         id: "openPurchase",
//         accessorKey: "Open Purchase",
//         header: "Open Purchase",
//     },
//     {
//         id: "saleQty",
//         accessorKey: "Sale Qty",
//         header: "Sale Qty",
//     },
//     {
//         id: "saleAmount",
//         accessorKey: "Sale Amount",
//         header: "Sale Amount",
//         cell: ({ row }) => {
//             const amount = parseFloat(row.getValue("saleAmount"))
//             return new Intl.NumberFormat("en-IN", {
//                 style: "currency",
//                 currency: "INR",
//             }).format(amount)
//         },
//     },
//     {
//         id: "saleThrough",
//         accessorKey: "Sale Through",
//         header: "Sale Through",
//     },
//     {
//         id: "doh",
//         accessorKey: "DOH",
//         header: "DOH",
//     },
//     {
//         id: "ros",
//         accessorKey: "ROS",
//         header: "ROS",
//     },
//     {
//         id: "vendorName",
//         accessorKey: "Vendor Name",
//         header: "Vendor Name",
//     },
// ]

export const OtherColumns: ColumnDef<CategoryData>[] = [
    {
        id: "Sku Code",
        accessorKey: "Sku Code",
        header: "SKU Code",
        cell: ({ row }) => <div className="font-medium">{row.getValue("skuCode")}</div>,
    },
    {
        id: "Parent SKU",
        accessorKey: "Parent SKU",
        header: "Parent SKU",
        // cell: ({ row }) => <div className="font-medium">{row.getValue("parentSKU")}</div>,
    },
    {
        id: "Size",
        accessorKey: "Size",
        header: "Size",
        // cell: ({ row }) => <div className="font-medium">{row.getValue("parentSKU")}</div>,
    },
    {
        id: "Category Name",
        accessorKey: "Category Name",
        header: "Category",
    },
    {
        id: "Sub Category",
        accessorKey: "Sub Category",
        header: "Sub Category",
    },
    {
        id: "Sale Qty",
        accessorKey: "Sale Qty",
        header: "Sale Qty",
    },
    {
        id: "Sale Amount",
        accessorKey: "Sale Amount",
        header: "Sale Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("saleAmount"))
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)
        },
    },
    {
        id: "Vendor Name",
        accessorKey: "Vendor Name",
        header: "Vendor Name",
    },
    {
        id: "Static Grade",
        accessorKey: "Static Grade",
        header: "Static Grade",
        cell: ({ row }) => {
            const grade: string = row.getValue("staticGrade")
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
        id: "Month Grade",
        accessorKey: "Month Grade",
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
        id: "Available Inventory",
        accessorKey: "Available Inventory",
        header: "Available Inventory",
    },
    {
        id: "Open Purchase",
        accessorKey: "Open Purchase",
        header: "Open Purchase",
    },
    { id: "Required Qty", accessorKey: "Required Qty", header: "Required Qty" },
    { id: "Order Qty", accessorKey: "Order Qty", header: "Order Qty" },
    {
        id: "Sale Through",
        accessorKey: "Sale Through",
        header: "Sale Through",
    },
    { id: "Vendor Price", accessorKey: "Vendor Price", header: "Vendor Price" },
    { id: "Total Amount", accessorKey: "Total Amount", header: "Total Amount" },
    { id: "New SKU Code", accessorKey: "New SKU Code", header: "New SKU Code" },
    { id: "Days of positive inventory", accessorKey: "Days of positive inventory", header: "Days of positive inventory" },
    {
        id: "ROS",
        accessorKey: "ROS",
        header: "ROS",
    },
    {
        id: "DOH",
        accessorKey: "DOH",
        header: "DOH",
    },
    // { accessorKey: "Static Grade", header: "Static Grade" },
    // { accessorKey: "Month Grade", header: "Month Grade" },
    { id: "Comment", accessorKey: "Comment", header: "Comment" },
    {
        id: "Avg Selling Price",
        accessorKey: "Avg Selling Price",
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
        id: 'Multiple Price',
        accessorKey: "Multiple Price",
        header: "Multiple Price",
        cell: ({ row }) => {
            return (
                <div className="font-medium">{row.getValue("Multiple Price")}</div>
            )
        },

    },
    // {
    //     id: "newSkuCode",
    //     accessorKey: "New SKU Code",
    //     header: "New SKU Code",
    // },


]