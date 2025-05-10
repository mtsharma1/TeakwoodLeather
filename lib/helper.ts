import { GradeResult, SupportItem } from "@/types/order"

export const MULTIPLE_SELLING_PRICE = 2
// Constants
const GRADE_THRESHOLDS = {
    A: 30,
    B: 10
} as const

export type MonthGradeTypes = "A" | "B" | "C" | "D" | "NEW"
export const grades: Array<MonthGradeTypes> = ['A', 'B', 'C', 'D', 'NEW'];
export const excludeSubCategoryUnderStock = [
    "COMBO-2",
    "COMBOS",
    "LEATHER MEN AUTOLOCK BELT",
    "LEATHER MEN REVERSIBLE BELT",
    "LOGO",
    "PULLER"
] 

export const excludeSubCategoryOverStock = [
    "Men Buckle"
] 

export const excludeSubCategoryOrderSummary = [
    "LEATHER MEN AUTOLOCK BELT",
    "LEATHER MEN REVERSIBLE BELT",
]

export const compareGrades = (monthGrade: string, staticGrade: string): string => {
    const monthNum = Number(monthGrade)
    const staticNum = Number(staticGrade)
    if (monthNum > staticNum) return "Degrade"
    if (monthNum < staticNum) return "Upgrade"
    return "No Change"
}

const calcGrade = (saleQty: number) => {
    if (saleQty > GRADE_THRESHOLDS.A) return "A"
    if (saleQty >= GRADE_THRESHOLDS.B) return "B"
    return "C"
}

export const calcMonthGrade = (saleQty: number): GradeResult => {
    const grade: MonthGradeTypes = calcGrade(saleQty)
    return { grade, rank: UTILS.monthGrade[grade] }
}

export const calcStaticGrade = (grade: MonthGradeTypes): GradeResult => ({
    rank: UTILS.monthGrade[grade]
})

export const getSupportData = (subCategory: string, size: string): SupportItem | undefined => {
    const lookupKey = `${subCategory}_${size.toUpperCase()}`
    return SUPPORT.find(item => {
        const supportKey = item["Sub Category New"] || item["Sub Category"]
        // console.log(supportKey === lookupKey || supportKey === subCategory)
        return supportKey === lookupKey || supportKey === subCategory
    })
}

export const UTILS = {
    "monthGrade": {
        "A": 4,
        "B": 3,
        "C": 2,
        "D": 1,
        "NEW": 0
    }
}

export const SUPPORT: SupportItem[] = [
    {
        "Sub Category": "LEATHER MEN SHOES",
        "Sub Category New": "LEATHER MEN SHOES_40",
        "Category": "SHOES",
        "Size": "40",
        "Ratio": "2",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER MEN SHOES",
        "Sub Category New": "LEATHER MEN SHOES_41",
        "Category": "SHOES",
        "Size": "41",
        "Ratio": "3",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER MEN SHOES",
        "Sub Category New": "LEATHER MEN SHOES_42",
        "Category": "SHOES",
        "Size": "42",
        "Ratio": "4",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER MEN SHOES",
        "Sub Category New": "LEATHER MEN SHOES_43",
        "Category": "SHOES",
        "Size": "43",
        "Ratio": "3",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER MEN SHOES",
        "Sub Category New": "LEATHER MEN SHOES_44",
        "Category": "SHOES",
        "Size": "44",
        "Ratio": "2",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER MEN SHOES",
        "Sub Category New": "LEATHER MEN SHOES_45",
        "Category": "SHOES",
        "Size": "45",
        "Ratio": "1",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "PU MEN SHOES",
        "Sub Category New": "PU MEN SHOES_40",
        "Category": "SHOES",
        "Size": "40",
        "Ratio": "2",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "PU MEN SHOES",
        "Sub Category New": "PU MEN SHOES_41",
        "Category": "SHOES",
        "Size": "41",
        "Ratio": "3",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "PU MEN SHOES",
        "Sub Category New": "PU MEN SHOES_42",
        "Category": "SHOES",
        "Size": "42",
        "Ratio": "4",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "PU MEN SHOES",
        "Sub Category New": "PU MEN SHOES_43",
        "Category": "SHOES",
        "Size": "43",
        "Ratio": "3",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "PU MEN SHOES",
        "Sub Category New": "PU MEN SHOES_44",
        "Category": "SHOES",
        "Size": "44",
        "Ratio": "2",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "PU MEN SHOES",
        "Sub Category New": "PU MEN SHOES_45",
        "Category": "SHOES",
        "Size": "45",
        "Ratio": "1",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER WOMEN SHOES",
        "Sub Category New": "LEATHER WOMEN SHOES_36",
        "Category": "SHOES",
        "Size": "36",
        "Ratio": "2",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER WOMEN SHOES",
        "Sub Category New": "LEATHER WOMEN SHOES_37",
        "Category": "SHOES",
        "Size": "37",
        "Ratio": "3",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER WOMEN SHOES",
        "Sub Category New": "LEATHER WOMEN SHOES_38",
        "Category": "SHOES",
        "Size": "38",
        "Ratio": "4",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER WOMEN SHOES",
        "Sub Category New": "LEATHER WOMEN SHOES_39",
        "Category": "SHOES",
        "Size": "39",
        "Ratio": "3",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER WOMEN SHOES",
        "Sub Category New": "LEATHER WOMEN SHOES_40",
        "Category": "SHOES",
        "Size": "40",
        "Ratio": "2",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER WOMEN SHOES",
        "Sub Category New": "LEATHER WOMEN SHOES_41",
        "Category": "SHOES",
        "Size": "41",
        "Ratio": "1",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "KIDS SHOE",
        "Sub Category New": "KIDS SHOE_18",
        "Category": "SHOES",
        "Size": "18",
        "Ratio": "1",
        "Ratio Sum": "14"
    },
    {
        "Sub Category": "KIDS SHOE",
        "Sub Category New": "KIDS SHOE_19",
        "Category": "SHOES",
        "Size": "19",
        "Ratio": "2",
        "Ratio Sum": "14"
    },
    {
        "Sub Category": "KIDS SHOE",
        "Sub Category New": "KIDS SHOE_20",
        "Category": "SHOES",
        "Size": "20",
        "Ratio": "2",
        "Ratio Sum": "14"
    },
    {
        "Sub Category": "KIDS SHOE",
        "Sub Category New": "KIDS SHOE_21",
        "Category": "SHOES",
        "Size": "21",
        "Ratio": "2",
        "Ratio Sum": "14"
    },
    {
        "Sub Category": "KIDS SHOE",
        "Sub Category New": "KIDS SHOE_22",
        "Category": "SHOES",
        "Size": "22",
        "Ratio": "2",
        "Ratio Sum": "14"
    },
    {
        "Sub Category": "KIDS SHOE",
        "Sub Category New": "KIDS SHOE_23",
        "Category": "SHOES",
        "Size": "23",
        "Ratio": "2",
        "Ratio Sum": "14"
    },
    {
        "Sub Category": "KIDS SHOE",
        "Sub Category New": "KIDS SHOE_24",
        "Category": "SHOES",
        "Size": "24",
        "Ratio": "2",
        "Ratio Sum": "14"
    },
    {
        "Sub Category": "KIDS SHOE",
        "Sub Category New": "KIDS SHOE_25",
        "Category": "SHOES",
        "Size": "25",
        "Ratio": "1",
        "Ratio Sum": "14"
    },
    {
        "Sub Category": "LEATHER KID SHOES",
        "Sub Category New": "LEATHER KID SHOES",
        "Category": "SHOES",
        "Size": "OS",
        "Ratio": "",
        "Ratio Sum": ""
    },
    {
        "Sub Category": "LEATHER SHOES",
        "Sub Category New": "LEATHER SHOES",
        "Category": "SHOES",
        "Size": "",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN JACKET",
        "Sub Category New": "LEATHER MEN JACKET_M",
        "Category": "LEATHER JACKET",
        "Size": "M",
        "Ratio": "3",
        "Ratio Sum": "13"
    },
    {
        "Sub Category": "LEATHER MEN JACKET",
        "Sub Category New": "LEATHER MEN JACKET_L",
        "Category": "LEATHER JACKET",
        "Size": "L",
        "Ratio": "4",
        "Ratio Sum": "13"
    },
    {
        "Sub Category": "LEATHER MEN JACKET",
        "Sub Category New": "LEATHER MEN JACKET_S",
        "Category": "LEATHER JACKET",
        "Size": "S",
        "Ratio": "3",
        "Ratio Sum": "13"
    },
    {
        "Sub Category": "LEATHER MEN JACKET",
        "Sub Category New": "LEATHER MEN JACKET_XL",
        "Category": "LEATHER JACKET",
        "Size": "XL",
        "Ratio": "2",
        "Ratio Sum": "13"
    },
    {
        "Sub Category": "LEATHER MEN JACKET",
        "Sub Category New": "LEATHER MEN JACKET_XXL",
        "Category": "LEATHER JACKET",
        "Size": "XXL",
        "Ratio": "1",
        "Ratio Sum": "13"
    },
    {
        "Sub Category": "LEATHER WOMEN JACKET",
        "Sub Category New": "LEATHER WOMEN JACKET_M",
        "Category": "LEATHER JACKET",
        "Size": "M",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN JACKET",
        "Sub Category New": "LEATHER WOMEN JACKET_XL",
        "Category": "LEATHER JACKET",
        "Size": "XL",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN JACKET",
        "Sub Category New": "LEATHER WOMEN JACKET_S",
        "Category": "LEATHER JACKET",
        "Size": "S",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN JACKET",
        "Sub Category New": "LEATHER WOMEN JACKET_L",
        "Category": "LEATHER JACKET",
        "Size": "L",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN CASUAL BELT",
        "Sub Category New": "LEATHER MEN CASUAL BELT_34",
        "Category": "LEATHER MEN CASUAL BELT",
        "Size": "34",
        "Ratio": "4",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER MEN CASUAL BELT",
        "Sub Category New": "LEATHER MEN CASUAL BELT_36",
        "Category": "LEATHER MEN CASUAL BELT",
        "Size": "36",
        "Ratio": "3",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER MEN CASUAL BELT",
        "Sub Category New": "LEATHER MEN CASUAL BELT_42",
        "Category": "LEATHER MEN CASUAL BELT",
        "Size": "42",
        "Ratio": "2",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER MEN CASUAL BELT",
        "Sub Category New": "LEATHER MEN CASUAL BELT_38",
        "Category": "LEATHER MEN CASUAL BELT",
        "Size": "38",
        "Ratio": "2",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER MEN CASUAL BELT",
        "Sub Category New": "LEATHER MEN CASUAL BELT_44",
        "Category": "LEATHER MEN CASUAL BELT",
        "Size": "44",
        "Ratio": "1",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "LEATHER MEN CASUAL BELT",
        "Sub Category New": "LEATHER MEN CASUAL BELT_40",
        "Category": "LEATHER MEN CASUAL BELT",
        "Size": "40",
        "Ratio": "2",
        "Ratio Sum": "15"
    },
    {
        "Sub Category": "TOILETRY BAG",
        "Sub Category New": "TOILETRY BAG_OS",
        "Category": "TOILETRY BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN BAG",
        "Sub Category New": "LEATHER MEN BAG_OS",
        "Category": "LEATHER MEN BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU MEN BAG",
        "Sub Category New": "PU MEN BAG_OS",
        "Category": "PU MEN BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN CASUAL BELT",
        "Sub Category New": "LEATHER MEN CASUAL BELT_OS",
        "Category": "LEATHER MEN CASUAL BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "16"
    },
    {
        "Sub Category": "TSA LOCK",
        "Sub Category New": "TSA LOCK_OS",
        "Category": "TSA LOCK",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN WALLET",
        "Sub Category New": "LEATHER MEN WALLET_OS",
        "Category": "LEATHER MEN WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN JACKET",
        "Sub Category New": "LEATHER MEN JACKET_OS",
        "Category": "LEATHER MEN JACKET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER JACKETS",
        "Sub Category New": "LEATHER JACKETS_OS",
        "Category": "LEATHER JACKETS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU WOMEN BELT",
        "Sub Category New": "PU WOMEN BELT_OS",
        "Category": "PU WOMEN BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU WOMEN WALLET",
        "Sub Category New": "PU WOMEN WALLET_OS",
        "Category": "PU WOMEN WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU MEN WALLET",
        "Sub Category New": "PU MEN WALLET_OS",
        "Category": "PU MEN WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PEN",
        "Sub Category New": "PEN_OS",
        "Category": "PEN",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "UNISEX BACKPACK",
        "Sub Category New": "UNISEX BACKPACK_OS",
        "Category": "UNISEX BACKPACK",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET TRAINING PADS",
        "Sub Category New": "PET TRAINING PADS_OS",
        "Category": "PET TRAINING PADS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Hard Trolley Bag",
        "Sub Category New": "Hard Trolley Bag_OS",
        "Category": "Hard Trolley Bag",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU MEN STRAP",
        "Sub Category New": "PU MEN STRAP_OS",
        "Category": "PU MEN STRAP",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "MEN BUCKLE",
        "Sub Category New": "MEN BUCKLE_OS",
        "Category": "MEN BUCKLE",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN STRAP",
        "Sub Category New": "LEATHER MEN STRAP_OS",
        "Category": "LEATHER MEN STRAP",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PORTFOLIO",
        "Sub Category New": "PORTFOLIO_OS",
        "Category": "PORTFOLIO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU WOMEN BAG",
        "Sub Category New": "PU WOMEN BAG_OS",
        "Category": "PU WOMEN BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN WALLET",
        "Sub Category New": "LEATHER WOMEN WALLET_OS",
        "Category": "LEATHER WOMEN WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Soft Trolley Bag",
        "Sub Category New": "Soft Trolley Bag_OS",
        "Category": "Soft Trolley Bag",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU UNISEX WALLET",
        "Sub Category New": "PU UNISEX WALLET_OS",
        "Category": "PU UNISEX WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN CASUAL BELT",
        "Sub Category New": "LEATHER WOMEN CASUAL BELT_OS",
        "Category": "LEATHER WOMEN CASUAL BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "KEY CHAIN",
        "Sub Category New": "KEY CHAIN_OS",
        "Category": "KEY CHAIN",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN BAG",
        "Sub Category New": "LEATHER WOMEN BAG_OS",
        "Category": "LEATHER WOMEN BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER UNISEX BAG",
        "Sub Category New": "LEATHER UNISEX BAG_OS",
        "Category": "LEATHER UNISEX BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "TOILETRY KIT",
        "Sub Category New": "TOILETRY KIT_OS",
        "Category": "TOILETRY KIT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DOG DEEP CLEAN SHAMPOO",
        "Sub Category New": "DOG DEEP CLEAN SHAMPOO_OS",
        "Category": "DOG DEEP CLEAN SHAMPOO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "IPHONE 12/13 MOBILE COVER",
        "Sub Category New": "IPHONE 12/13 MOBILE COVER_OS",
        "Category": "IPHONE 12/13 MOBILE COVER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "HEADPHONE CASE",
        "Sub Category New": "HEADPHONE CASE_OS",
        "Category": "HEADPHONE CASE",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WAIST BAG",
        "Sub Category New": "LEATHER WAIST BAG_OS",
        "Category": "LEATHER WAIST BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER GLOVES",
        "Sub Category New": "LEATHER GLOVES_OS",
        "Category": "LEATHER GLOVES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DUFFLE BAG",
        "Sub Category New": "DUFFLE BAG_OS",
        "Category": "DUFFLE BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DUFFLE TROLLEY BAG",
        "Sub Category New": "DUFFLE TROLLEY BAG_OS",
        "Category": "DUFFLE TROLLEY BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "UNISEX RUCKSACK BAG",
        "Sub Category New": "UNISEX RUCKSACK BAG_OS",
        "Category": "UNISEX RUCKSACK BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "WOMEN DRESS BELT",
        "Sub Category New": "WOMEN DRESS BELT_OS",
        "Category": "WOMEN DRESS BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU MEN BELT",
        "Sub Category New": "PU MEN BELT_OS",
        "Category": "PU MEN BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "WATCH STRAPS",
        "Sub Category New": "WATCH STRAPS_OS",
        "Category": "WATCH STRAPS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER UNISEX WALLET",
        "Sub Category New": "LEATHER UNISEX WALLET_OS",
        "Category": "LEATHER UNISEX WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER AUTOLOCK STRAP",
        "Sub Category New": "LEATHER AUTOLOCK STRAP_OS",
        "Category": "LEATHER AUTOLOCK STRAP",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN REVERSIBLE BELT",
        "Sub Category New": "LEATHER MEN REVERSIBLE BELT_OS",
        "Category": "LEATHER MEN REVERSIBLE BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "COMBOS",
        "Sub Category New": "COMBOS_OS",
        "Category": "COMBOS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU MEN SLIDER",
        "Sub Category New": "PU MEN SLIDER_OS",
        "Category": "PU MEN SLIDER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BLT_WLT",
        "Sub Category New": "BLT_WLT_OS",
        "Category": "BLT_WLT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "TROLLEY SET",
        "Sub Category New": "TROLLEY SET_OS",
        "Category": "TROLLEY SET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BELT",
        "Sub Category New": "BELT_OS",
        "Category": "BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "SHOES",
        "Sub Category New": "SHOES_OS",
        "Category": "SHOES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "WALLET",
        "Sub Category New": "WALLET_OS",
        "Category": "WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JACKET",
        "Sub Category New": "JACKET_OS",
        "Category": "JACKET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET TOY",
        "Sub Category New": "PET TOY_OS",
        "Category": "PET TOY",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET COMBO- 1",
        "Sub Category New": "PET COMBO- 1_OS",
        "Category": "PET COMBO- 1",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET TRAVEL ACC",
        "Sub Category New": "PET TRAVEL ACC_OS",
        "Category": "PET TRAVEL ACC",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BUCKLE & STRAP",
        "Sub Category New": "BUCKLE & STRAP_OS",
        "Category": "BUCKLE & STRAP",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BAGS",
        "Sub Category New": "BAGS_OS",
        "Category": "BAGS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WALLET",
        "Sub Category New": "LEATHER WALLET_OS",
        "Category": "LEATHER WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU BELTS",
        "Sub Category New": "PU BELTS_OS",
        "Category": "PU BELTS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "KIDS SCHOOL BAG",
        "Sub Category New": "KIDS SCHOOL BAG_OS",
        "Category": "KIDS SCHOOL BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Hard Trolley Bags",
        "Sub Category New": "Hard Trolley Bags_OS",
        "Category": "Hard Trolley Bags",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU BAGS",
        "Sub Category New": "PU BAGS_OS",
        "Category": "PU BAGS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Bag",
        "Sub Category New": "Bag_OS",
        "Category": "Bag",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN JACKET",
        "Sub Category New": "LEATHER WOMEN JACKET_OS",
        "Category": "LEATHER WOMEN JACKET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "WOMEN BELT",
        "Sub Category New": "WOMEN BELT_OS",
        "Category": "WOMEN BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BACKPACK",
        "Sub Category New": "BACKPACK_OS",
        "Category": "BACKPACK",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BAD SKU",
        "Sub Category New": "BAD SKU_OS",
        "Category": "BAD SKU",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "COMBO-2",
        "Sub Category New": "COMBO-2_OS",
        "Category": "COMBO-2",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BELT& WLT",
        "Sub Category New": "BELT& WLT_OS",
        "Category": "BELT& WLT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BELTS",
        "Sub Category New": "BELTS_OS",
        "Category": "BELTS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "COMBO",
        "Sub Category New": "COMBO_OS",
        "Category": "COMBO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BELT_WLT",
        "Sub Category New": "BELT_WLT_OS",
        "Category": "BELT_WLT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN AUTOLOCK BELT",
        "Sub Category New": "LEATHER MEN AUTOLOCK BELT_OS",
        "Category": "LEATHER MEN AUTOLOCK BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "COMBO-5",
        "Sub Category New": "COMBO-5_OS",
        "Category": "COMBO-5",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER BAGS",
        "Sub Category New": "LEATHER BAGS_OS",
        "Category": "LEATHER BAGS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU UNISEX BELT",
        "Sub Category New": "PU UNISEX BELT_OS",
        "Category": "PU UNISEX BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "GLOVES",
        "Sub Category New": "GLOVES_OS",
        "Category": "GLOVES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "MASK",
        "Sub Category New": "MASK_OS",
        "Category": "MASK",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PPE KIT",
        "Sub Category New": "PPE KIT_OS",
        "Category": "PPE KIT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "SANITISER",
        "Sub Category New": "SANITISER_OS",
        "Category": "SANITISER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "AQUA SANTISER",
        "Sub Category New": "AQUA SANTISER_OS",
        "Category": "AQUA SANTISER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DH SANTISER",
        "Sub Category New": "DH SANTISER_OS",
        "Category": "DH SANTISER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JKT_1231_BLACK_2XL",
        "Sub Category New": "JKT_1231_BLACK_2XL_OS",
        "Category": "JKT_1231_BLACK_2XL",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JKT_1231_BLACK_M",
        "Sub Category New": "JKT_1231_BLACK_M_OS",
        "Category": "JKT_1231_BLACK_M",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JKT_1231_BLACK_XL",
        "Sub Category New": "JKT_1231_BLACK_XL_OS",
        "Category": "JKT_1231_BLACK_XL",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JKT_2385_BLACK_2XL",
        "Sub Category New": "JKT_2385_BLACK_2XL_OS",
        "Category": "JKT_2385_BLACK_2XL",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JKT_2385_BLACK_L",
        "Sub Category New": "JKT_2385_BLACK_L_OS",
        "Category": "JKT_2385_BLACK_L",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JKT_2385_BLACK_M",
        "Sub Category New": "JKT_2385_BLACK_M_OS",
        "Category": "JKT_2385_BLACK_M",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JKT_2385_BLACK_S",
        "Sub Category New": "JKT_2385_BLACK_S_OS",
        "Category": "JKT_2385_BLACK_S",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JKT_2385_BLACK_XL",
        "Sub Category New": "JKT_2385_BLACK_XL_OS",
        "Category": "JKT_2385_BLACK_XL",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JKT_4922_TEAKWOOD_L",
        "Sub Category New": "JKT_4922_TEAKWOOD_L_OS",
        "Category": "JKT_4922_TEAKWOOD_L",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JKT_4922_TEAKWOOD_M",
        "Sub Category New": "JKT_4922_TEAKWOOD_M_OS",
        "Category": "JKT_4922_TEAKWOOD_M",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JKT_4922_TEAKWOOD_S",
        "Sub Category New": "JKT_4922_TEAKWOOD_S_OS",
        "Category": "JKT_4922_TEAKWOOD_S",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Men Jackets",
        "Sub Category New": "Teakwood Men Jackets_OS",
        "Category": "Teakwood Men Jackets",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU WOMEN JACKET",
        "Sub Category New": "PU WOMEN JACKET_OS",
        "Category": "PU WOMEN JACKET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU MEN BAGS",
        "Sub Category New": "PU MEN BAGS_OS",
        "Category": "PU MEN BAGS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DELIST",
        "Sub Category New": "DELIST_OS",
        "Category": "DELIST",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "N4451_BLACK_XS",
        "Sub Category New": "N4451_BLACK_XS_OS",
        "Category": "N4451_BLACK_XS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "N4466_BLACK_4XL",
        "Sub Category New": "N4466_BLACK_4XL_OS",
        "Category": "N4466_BLACK_4XL",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "NECK PILLOW",
        "Sub Category New": "NECK PILLOW_OS",
        "Category": "NECK PILLOW",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU Jackets",
        "Sub Category New": "PU Jackets_OS",
        "Category": "PU Jackets",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "UNISEX BAG PACK",
        "Sub Category New": "UNISEX BAG PACK_OS",
        "Category": "UNISEX BAG PACK",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Leathers Men Tan Brown Solid Belt-34-Tan",
        "Sub Category New": "Teakwood Leathers Men Tan Brown Solid Belt-34-Tan_OS",
        "Category": "Teakwood Leathers Men Tan Brown Solid Belt-34-Tan",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Leathers Men Tan Brown Solid Belt-36-Tan",
        "Sub Category New": "Teakwood Leathers Men Tan Brown Solid Belt-36-Tan_OS",
        "Category": "Teakwood Leathers Men Tan Brown Solid Belt-36-Tan",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Leathers Men Tan Brown Solid Belt-40-Tan",
        "Sub Category New": "Teakwood Leathers Men Tan Brown Solid Belt-40-Tan_OS",
        "Category": "Teakwood Leathers Men Tan Brown Solid Belt-40-Tan",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Watches",
        "Sub Category New": "Watches_OS",
        "Category": "Watches",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "1006BLACK",
        "Sub Category New": "1006BLACK_OS",
        "Category": "1006BLACK",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "2538_Brown",
        "Sub Category New": "2538_Brown_OS",
        "Category": "2538_Brown",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN SHOES",
        "Sub Category New": "LEATHER MEN SHOES_OS",
        "Category": "LEATHER MEN SHOES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU MEN DUFFELE BAG",
        "Sub Category New": "PU MEN DUFFELE BAG_OS",
        "Category": "PU MEN DUFFELE BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN CASUAL  BELT",
        "Sub Category New": "LEATHER MEN CASUAL  BELT_OS",
        "Category": "LEATHER MEN CASUAL  BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "APSIS COMBO",
        "Sub Category New": "APSIS COMBO_OS",
        "Category": "APSIS COMBO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "TEAKWOOD LEATHER",
        "Sub Category New": "TEAKWOOD LEATHER_OS",
        "Category": "TEAKWOOD LEATHER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "APSIS COMBO-2",
        "Sub Category New": "APSIS COMBO-2_OS",
        "Category": "APSIS COMBO-2",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Towel",
        "Sub Category New": "Towel_OS",
        "Category": "Towel",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Wipes",
        "Sub Category New": "Wipes_OS",
        "Category": "Wipes",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Sleeker",
        "Sub Category New": "Sleeker_OS",
        "Category": "Sleeker",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Comb",
        "Sub Category New": "Comb_OS",
        "Category": "Comb",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Leashes",
        "Sub Category New": "Leashes_OS",
        "Category": "Leashes",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Toy",
        "Sub Category New": "Toy_OS",
        "Category": "Toy",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Bows Collar",
        "Sub Category New": "Bows Collar_OS",
        "Category": "Bows Collar",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET COLLAR",
        "Sub Category New": "PET COLLAR_OS",
        "Category": "PET COLLAR",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET LEASHES",
        "Sub Category New": "PET LEASHES_OS",
        "Category": "PET LEASHES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET BOWS & TIES",
        "Sub Category New": "PET BOWS & TIES_OS",
        "Category": "PET BOWS & TIES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET BED",
        "Sub Category New": "PET BED_OS",
        "Category": "PET BED",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "FEEDING BOWL",
        "Sub Category New": "FEEDING BOWL_OS",
        "Category": "FEEDING BOWL",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "STRAP",
        "Sub Category New": "STRAP_OS",
        "Category": "STRAP",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JKT_1008_Bu_L",
        "Sub Category New": "JKT_1008_Bu_L_OS",
        "Category": "JKT_1008_Bu_L",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JKT_1008_Bu_XL",
        "Sub Category New": "JKT_1008_Bu_XL_OS",
        "Category": "JKT_1008_Bu_XL",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JKT_1008_Bu_XXL",
        "Sub Category New": "JKT_1008_Bu_XXL_OS",
        "Category": "JKT_1008_Bu_XXL",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DH_SANTISER",
        "Sub Category New": "DH_SANTISER_OS",
        "Category": "DH_SANTISER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN SHOES",
        "Sub Category New": "LEATHER WOMEN SHOES_OS",
        "Category": "LEATHER WOMEN SHOES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Face Shield",
        "Sub Category New": "Face Shield_OS",
        "Category": "Face Shield",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BUNDLE-1",
        "Sub Category New": "BUNDLE-1_OS",
        "Category": "BUNDLE-1",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET BRUSHES & COMBS-WOODEN PIN BRUSH",
        "Sub Category New": "PET BRUSHES & COMBS-WOODEN PIN BRUSH_OS",
        "Category": "PET BRUSHES & COMBS-WOODEN PIN BRUSH",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET SCOOPER",
        "Sub Category New": "PET SCOOPER_OS",
        "Category": "PET SCOOPER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET LEASHES-IRON CHAIN LEASH",
        "Sub Category New": "PET LEASHES-IRON CHAIN LEASH_OS",
        "Category": "PET LEASHES-IRON CHAIN LEASH",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET GROOMING TOOLS",
        "Sub Category New": "PET GROOMING TOOLS_OS",
        "Category": "PET GROOMING TOOLS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET DIAPERS",
        "Sub Category New": "PET DIAPERS_OS",
        "Category": "PET DIAPERS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "CARD HOLDER",
        "Sub Category New": "CARD HOLDER_OS",
        "Category": "CARD HOLDER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU SWACH",
        "Sub Category New": "PU SWACH_OS",
        "Category": "PU SWACH",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "CATALOGUE",
        "Sub Category New": "CATALOGUE_OS",
        "Category": "CATALOGUE",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET LEASH & COLLAR",
        "Sub Category New": "PET LEASH & COLLAR_OS",
        "Category": "PET LEASH & COLLAR",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Full-Sleeve Leather Jacket",
        "Sub Category New": "Black Full-Sleeve Leather Jacket_OS",
        "Category": "Black Full-Sleeve Leather Jacket",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Textured Tri-fold Leather Wallets",
        "Sub Category New": "Brown Textured Tri-fold Leather Wallets_OS",
        "Category": "Brown Textured Tri-fold Leather Wallets",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Full-Sleeve Leather Biker Jacket",
        "Sub Category New": "Brown Full-Sleeve Leather Biker Jacket_OS",
        "Category": "Brown Full-Sleeve Leather Biker Jacket",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Charcoal Grey Full-Sleeve Leather Biker Jacket",
        "Sub Category New": "Charcoal Grey Full-Sleeve Leather Biker Jacket_OS",
        "Category": "Charcoal Grey Full-Sleeve Leather Biker Jacket",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Tan Brown Full-Sleeve Leather Jacket",
        "Sub Category New": "Tan Brown Full-Sleeve Leather Jacket_OS",
        "Category": "Tan Brown Full-Sleeve Leather Jacket",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Solid Three Fold Leather Wallet",
        "Sub Category New": "Black Solid Three Fold Leather Wallet_OS",
        "Category": "Black Solid Three Fold Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Bi Fold Leather Wallet",
        "Sub Category New": "Brown Bi Fold Leather Wallet_OS",
        "Category": "Brown Bi Fold Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Full-Sleeve Leather Jacket",
        "Sub Category New": "Brown Full-Sleeve Leather Jacket_OS",
        "Category": "Brown Full-Sleeve Leather Jacket",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Leather Full-Sleeve Biker Jacket",
        "Sub Category New": "Brown Leather Full-Sleeve Biker Jacket_OS",
        "Category": "Brown Leather Full-Sleeve Biker Jacket",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Two Fold Leather Wallet",
        "Sub Category New": "Brown Two Fold Leather Wallet_OS",
        "Category": "Brown Two Fold Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Two-fold Leather Wallet",
        "Sub Category New": "Brown Two-fold Leather Wallet_OS",
        "Category": "Brown Two-fold Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Leather Two Fold Wallet",
        "Sub Category New": "Black Leather Two Fold Wallet_OS",
        "Category": "Black Leather Two Fold Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Textured Leather Wallet",
        "Sub Category New": "Brown Textured Leather Wallet_OS",
        "Category": "Brown Textured Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Textured Two-fold Leather Wallet",
        "Sub Category New": "Black Textured Two-fold Leather Wallet_OS",
        "Category": "Black Textured Two-fold Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Leather Two Fold Wallet",
        "Sub Category New": "Brown Leather Two Fold Wallet_OS",
        "Category": "Brown Leather Two Fold Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Blue & Off-White Colourblocked Two Fold Leather Wallet",
        "Sub Category New": "Blue & Off-White Colourblocked Two Fold Leather Wallet_OS",
        "Category": "Blue & Off-White Colourblocked Two Fold Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Blue Full-Sleeve Leather Jacket",
        "Sub Category New": "Blue Full-Sleeve Leather Jacket_OS",
        "Category": "Blue Full-Sleeve Leather Jacket",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Blue Textured Two-fold Leather Wallet",
        "Sub Category New": "Blue Textured Two-fold Leather Wallet_OS",
        "Category": "Blue Textured Two-fold Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Textured Two Fold Leather Wallet",
        "Sub Category New": "Brown Textured Two Fold Leather Wallet_OS",
        "Category": "Brown Textured Two Fold Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Three-fold Leather Wallet",
        "Sub Category New": "Brown Three-fold Leather Wallet_OS",
        "Category": "Brown Three-fold Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Navy Blue Two Fold Leather Wallet",
        "Sub Category New": "Navy Blue Two Fold Leather Wallet_OS",
        "Category": "Navy Blue Two Fold Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Colourblocked Two Fold Leather Wallet",
        "Sub Category New": "Brown Colourblocked Two Fold Leather Wallet_OS",
        "Category": "Brown Colourblocked Two Fold Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Tan Brown Textured Two Fold Leather Wallet",
        "Sub Category New": "Tan Brown Textured Two Fold Leather Wallet_OS",
        "Category": "Tan Brown Textured Two Fold Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Textured Two-fold Leather Wallet",
        "Sub Category New": "Brown Textured Two-fold Leather Wallet_OS",
        "Category": "Brown Textured Two-fold Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Navy Blue Leather Two Fold Wallet",
        "Sub Category New": "Navy Blue Leather Two Fold Wallet_OS",
        "Category": "Navy Blue Leather Two Fold Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Full-Sleeve Printed Leather Jacket",
        "Sub Category New": "Brown Full-Sleeve Printed Leather Jacket_OS",
        "Category": "Brown Full-Sleeve Printed Leather Jacket",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Full-Sleeve Leather Biker Jacket",
        "Sub Category New": "Black Full-Sleeve Leather Biker Jacket_OS",
        "Category": "Black Full-Sleeve Leather Biker Jacket",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Full-Sleeve Water Resistant Leather Jacket",
        "Sub Category New": "Brown Full-Sleeve Water Resistant Leather Jacket_OS",
        "Category": "Brown Full-Sleeve Water Resistant Leather Jacket",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Textured Leather Wallet",
        "Sub Category New": "Black Textured Leather Wallet_OS",
        "Category": "Black Textured Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Two Fold Leather Wallet",
        "Sub Category New": "Black Two Fold Leather Wallet_OS",
        "Category": "Black Two Fold Leather Wallet",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Olive Green Striped Full-Sleeve Leather Biker Jacket",
        "Sub Category New": "Olive Green Striped Full-Sleeve Leather Biker Jacket_OS",
        "Category": "Olive Green Striped Full-Sleeve Leather Biker Jacket",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Blue Full-Sleeve Leather Biker Jacket",
        "Sub Category New": "Blue Full-Sleeve Leather Biker Jacket_OS",
        "Category": "Blue Full-Sleeve Leather Biker Jacket",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Synthetic Leather Slip-On Shoes",
        "Sub Category New": "Brown Synthetic Leather Slip-On Shoes_OS",
        "Category": "Brown Synthetic Leather Slip-On Shoes",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Tan Full Sleeve Leather Biker Jacket",
        "Sub Category New": "Tan Full Sleeve Leather Biker Jacket_OS",
        "Category": "Tan Full Sleeve Leather Biker Jacket",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Leather Slippers",
        "Sub Category New": "Black Leather Slippers_OS",
        "Category": "Black Leather Slippers",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Synthetic Leather Slippers",
        "Sub Category New": "Black Synthetic Leather Slippers_OS",
        "Category": "Black Synthetic Leather Slippers",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Tan Brown Textured Slip-On Shoes",
        "Sub Category New": "Tan Brown Textured Slip-On Shoes_OS",
        "Category": "Tan Brown Textured Slip-On Shoes",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Synthetic Leather Slip-On Shoes",
        "Sub Category New": "Black Synthetic Leather Slip-On Shoes_OS",
        "Category": "Black Synthetic Leather Slip-On Shoes",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Blue Synthetic Leather Sneakers",
        "Sub Category New": "Blue Synthetic Leather Sneakers_OS",
        "Category": "Blue Synthetic Leather Sneakers",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Tan Brown Leather Slippers",
        "Sub Category New": "Tan Brown Leather Slippers_OS",
        "Category": "Tan Brown Leather Slippers",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Solid Leather Card Holder",
        "Sub Category New": "Black Solid Leather Card Holder_OS",
        "Category": "Black Solid Leather Card Holder",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DIARY",
        "Sub Category New": "DIARY_OS",
        "Category": "DIARY",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LOGO",
        "Sub Category New": "LOGO_OS",
        "Category": "LOGO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PULLER",
        "Sub Category New": "PULLER_OS",
        "Category": "PULLER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN STRAP",
        "Sub Category New": "LEATHER WOMEN STRAP_OS",
        "Category": "LEATHER WOMEN STRAP",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Leathers Women Brown Genuine Leather Belt ()",
        "Sub Category New": "Teakwood Leathers Women Brown Genuine Leather Belt ()_OS",
        "Category": "Teakwood Leathers Women Brown Genuine Leather Belt ()",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Leathers Women Casual Brown Genuine Leather Belt ()",
        "Sub Category New": "Teakwood Leathers Women Casual Brown Genuine Leather Belt ()_OS",
        "Category": "Teakwood Leathers Women Casual Brown Genuine Leather Belt ()",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Leathers Women Casual Tan Genuine Leather Belt ()",
        "Sub Category New": "Teakwood Leathers Women Casual Tan Genuine Leather Belt ()_OS",
        "Category": "Teakwood Leathers Women Casual Tan Genuine Leather Belt ()",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DOG HAIRFALL CONTROL SHAMPOO",
        "Sub Category New": "DOG HAIRFALL CONTROL SHAMPOO_OS",
        "Category": "DOG HAIRFALL CONTROL SHAMPOO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DOG DEEP MOISTURIZING SHAMPOO",
        "Sub Category New": "DOG DEEP MOISTURIZING SHAMPOO_OS",
        "Category": "DOG DEEP MOISTURIZING SHAMPOO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DOG ANTI TICK & FLEA SHAMPOO",
        "Sub Category New": "DOG ANTI TICK & FLEA SHAMPOO_OS",
        "Category": "DOG ANTI TICK & FLEA SHAMPOO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DOG DRY SHAMPOO",
        "Sub Category New": "DOG DRY SHAMPOO_OS",
        "Category": "DOG DRY SHAMPOO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "IPHONE 12/13 PRO MOBILE COVER",
        "Sub Category New": "IPHONE 12/13 PRO MOBILE COVER_OS",
        "Category": "IPHONE 12/13 PRO MOBILE COVER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "IPHONE 12/13 PRO MAX MOBILE COVER",
        "Sub Category New": "IPHONE 12/13 PRO MAX MOBILE COVER_OS",
        "Category": "IPHONE 12/13 PRO MAX MOBILE COVER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "AIRPOD CASE",
        "Sub Category New": "AIRPOD CASE_OS",
        "Category": "AIRPOD CASE",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "TROLLEY-1",
        "Sub Category New": "TROLLEY-1_OS",
        "Category": "TROLLEY-1",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU WOMEN SHOES",
        "Sub Category New": "PU WOMEN SHOES_OS",
        "Category": "PU WOMEN SHOES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DOG MAT",
        "Sub Category New": "DOG MAT_OS",
        "Category": "DOG MAT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "WOMEN BUCKLE",
        "Sub Category New": "WOMEN BUCKLE_OS",
        "Category": "WOMEN BUCKLE",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN REVERSIBLE BELT",
        "Sub Category New": "LEATHER WOMEN REVERSIBLE BELT_OS",
        "Category": "LEATHER WOMEN REVERSIBLE BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BELT & WALLET COMBO",
        "Sub Category New": "BELT & WALLET COMBO_OS",
        "Category": "BELT & WALLET COMBO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "COOM",
        "Sub Category New": "COOM_OS",
        "Category": "COOM",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Leathers Brown Casual Belt for Women",
        "Sub Category New": "Teakwood Leathers Brown Casual Belt for Women_OS",
        "Category": "Teakwood Leathers Brown Casual Belt for Women",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "TEAKWOOD _ Men Genuine Leather Peshwar Sandal_Size 6 Brown",
        "Sub Category New": "TEAKWOOD _ Men Genuine Leather Peshwar Sandal_Size 6 Brown_OS",
        "Category": "TEAKWOOD _ Men Genuine Leather Peshwar Sandal_Size 6 Brown",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DOG JACKET",
        "Sub Category New": "DOG JACKET_OS",
        "Category": "DOG JACKET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Apsis Women Black Textured Casual Belt",
        "Sub Category New": "Apsis Women Black Textured Casual Belt_OS",
        "Category": "Apsis Women Black Textured Casual Belt",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Apsis Women Black & Gold-Toned Belt",
        "Sub Category New": "Apsis Women Black & Gold-Toned Belt_OS",
        "Category": "Apsis Women Black & Gold-Toned Belt",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Apsis Women Black Slim Belt",
        "Sub Category New": "Apsis Women Black Slim Belt_OS",
        "Category": "Apsis Women Black Slim Belt",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Apsis Women Black Solid Belt",
        "Sub Category New": "Apsis Women Black Solid Belt_OS",
        "Category": "Apsis Women Black Solid Belt",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN STRAP",
        "Sub Category New": "LEATHER MEN STRAP_OS",
        "Category": "LEATHER MEN STRAP",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN CASUAL BELT",
        "Sub Category New": "LEATHER MEN CASUAL BELT_34",
        "Category": "LEATHER MEN CASUAL BELT",
        "Size": "34",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN CASUAL BELT",
        "Sub Category New": "LEATHER MEN CASUAL BELT_36",
        "Category": "LEATHER MEN CASUAL BELT",
        "Size": "36",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN CASUAL BELT",
        "Sub Category New": "LEATHER MEN CASUAL BELT_38",
        "Category": "LEATHER MEN CASUAL BELT",
        "Size": "38",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN CASUAL BELT",
        "Sub Category New": "LEATHER MEN CASUAL BELT_40",
        "Category": "LEATHER MEN CASUAL BELT",
        "Size": "40",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN CASUAL BELT",
        "Sub Category New": "LEATHER MEN CASUAL BELT_42",
        "Category": "LEATHER MEN CASUAL BELT",
        "Size": "42",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN CASUAL BELT",
        "Sub Category New": "LEATHER MEN CASUAL BELT_44",
        "Category": "LEATHER MEN CASUAL BELT",
        "Size": "44",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER BELTS",
        "Sub Category New": "LEATHER BELTS",
        "Category": "LEATHER BELTS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER STRAP",
        "Sub Category New": "LEATHER STRAP",
        "Category": "LEATHER STRAP",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "TEAKWOOD BUCKLE",
        "Sub Category New": "TEAKWOOD BUCKLE",
        "Category": "TEAKWOOD BUCKLE",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Trolley Bags",
        "Sub Category New": "Trolley Bags",
        "Category": "Trolley Bags",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "RUCKSACK",
        "Sub Category New": "RUCKSACK",
        "Category": "RUCKSACK",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "MISC",
        "Sub Category New": "MISC",
        "Category": "MISC",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU WALLET",
        "Sub Category New": "PU WALLET",
        "Category": "PU WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "TRAVEL ACCESSORIES",
        "Sub Category New": "TRAVEL ACCESSORIES",
        "Category": "TRAVEL ACCESSORIES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU SHOES",
        "Sub Category New": "PU SHOES",
        "Category": "PU SHOES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET SHAMPOOS",
        "Sub Category New": "PET SHAMPOOS",
        "Category": "PET SHAMPOOS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "TECH ACCESSORIES",
        "Sub Category New": "TECH ACCESSORIES",
        "Category": "TECH ACCESSORIES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU STRAP",
        "Sub Category New": "PU STRAP",
        "Category": "PU STRAP",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "APSIS BUCKLE",
        "Sub Category New": "APSIS BUCKLE",
        "Category": "APSIS BUCKLE",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Default",
        "Sub Category New": "Default",
        "Category": "Default",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Bundle2",
        "Sub Category New": "Bundle2",
        "Category": "Bundle2",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LITTER ACCESSORIES(GLOVES)",
        "Sub Category New": "LITTER ACCESSORIES(GLOVES)",
        "Category": "LITTER ACCESSORIES(GLOVES)",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET TOWEL",
        "Sub Category New": "PET TOWEL",
        "Category": "PET TOWEL",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LITTER ACCESSORIES(DUNG BAG)",
        "Sub Category New": "LITTER ACCESSORIES(DUNG BAG)",
        "Category": "LITTER ACCESSORIES(DUNG BAG)",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET WIPES",
        "Sub Category New": "PET WIPES",
        "Category": "PET WIPES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET BRUSHES & COMBS-SLEEKER",
        "Sub Category New": "PET BRUSHES & COMBS-SLEEKER",
        "Category": "PET BRUSHES & COMBS-SLEEKER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET BRUSHES & COMBS-DOUBLE SIDED",
        "Sub Category New": "PET BRUSHES & COMBS-DOUBLE SIDED",
        "Category": "PET BRUSHES & COMBS-DOUBLE SIDED",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET BRUSHES & COMBS-SINGLE SIDED",
        "Sub Category New": "PET BRUSHES & COMBS-SINGLE SIDED",
        "Category": "PET BRUSHES & COMBS-SINGLE SIDED",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET LEASHES-IRON CHAIN LEASHES",
        "Sub Category New": "PET LEASHES-IRON CHAIN LEASHES",
        "Category": "PET LEASHES-IRON CHAIN LEASHES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET TOY-ROPE",
        "Sub Category New": "PET TOY-ROPE",
        "Category": "PET TOY-ROPE",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET BOWS & TIES- BOW COLLAR",
        "Sub Category New": "PET BOWS & TIES- BOW COLLAR",
        "Category": "PET BOWS & TIES- BOW COLLAR",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET BRUSHES & COMBS-WOODEN",
        "Sub Category New": "PET BRUSHES & COMBS-WOODEN",
        "Category": "PET BRUSHES & COMBS-WOODEN",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BUCKLE",
        "Sub Category New": "BUCKLE",
        "Category": "BUCKLE",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET JACKET",
        "Sub Category New": "PET JACKET",
        "Category": "PET JACKET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "KIDS BACKPACK",
        "Sub Category New": "KIDS BACKPACK",
        "Category": "KIDS BACKPACK",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "MEN BUCKLE",
        "Sub Category New": "MEN BUCKLE_OS",
        "Category": "MEN BUCKLE",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN CASUAL BELT",
        "Sub Category New": "LEATHER WOMEN CASUAL BELT_OS",
        "Category": "LEATHER WOMEN CASUAL BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Hard Trolley Bag",
        "Sub Category New": "Hard Trolley Bag_S",
        "Category": "Hard Trolley Bag",
        "Size": "S",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN WALLET",
        "Sub Category New": "LEATHER MEN WALLET_OS",
        "Category": "LEATHER MEN WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "WOMEN DRESS BELT",
        "Sub Category New": "WOMEN DRESS BELT_OS",
        "Category": "WOMEN DRESS BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER AUTOLOCK STRAP",
        "Sub Category New": "LEATHER AUTOLOCK STRAP_OS",
        "Category": "LEATHER AUTOLOCK STRAP",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN WALLET",
        "Sub Category New": "LEATHER WOMEN WALLET_OS",
        "Category": "LEATHER WOMEN WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU MEN BAG",
        "Sub Category New": "PU MEN BAG_OS",
        "Category": "PU MEN BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "UNISEX RUCKSACK BAG",
        "Sub Category New": "UNISEX RUCKSACK BAG_OS",
        "Category": "UNISEX RUCKSACK BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN BAG",
        "Sub Category New": "LEATHER WOMEN BAG_OS",
        "Category": "LEATHER WOMEN BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU WOMEN BELT",
        "Sub Category New": "PU WOMEN BELT_OS",
        "Category": "PU WOMEN BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WAIST BAG",
        "Sub Category New": "LEATHER WAIST BAG_OS",
        "Category": "LEATHER WAIST BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN BAG",
        "Sub Category New": "LEATHER MEN BAG_OS",
        "Category": "LEATHER MEN BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER UNISEX BAG",
        "Sub Category New": "LEATHER UNISEX BAG_OS",
        "Category": "LEATHER UNISEX BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PEN",
        "Sub Category New": "PEN_OS",
        "Category": "PEN",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "UNISEX BACKPACK",
        "Sub Category New": "UNISEX BACKPACK_OS",
        "Category": "UNISEX BACKPACK",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "TOILETRY BAG",
        "Sub Category New": "TOILETRY BAG_OS",
        "Category": "TOILETRY BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER UNISEX WALLET",
        "Sub Category New": "LEATHER UNISEX WALLET_OS",
        "Category": "LEATHER UNISEX WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU WOMEN WALLET",
        "Sub Category New": "PU WOMEN WALLET_OS",
        "Category": "PU WOMEN WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "TSA LOCK",
        "Sub Category New": "TSA LOCK_OS",
        "Category": "TSA LOCK",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DUFFLE TROLLEY BAG",
        "Sub Category New": "DUFFLE TROLLEY BAG_L",
        "Category": "DUFFLE TROLLEY BAG",
        "Size": "L",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DUFFLE BAG",
        "Sub Category New": "DUFFLE BAG_L",
        "Category": "DUFFLE BAG",
        "Size": "L",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "WATCH STRAPS",
        "Sub Category New": "WATCH STRAPS_OS",
        "Category": "WATCH STRAPS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU UNISEX WALLET",
        "Sub Category New": "PU UNISEX WALLET_OS",
        "Category": "PU UNISEX WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "KEY CHAIN",
        "Sub Category New": "KEY CHAIN_OS",
        "Category": "KEY CHAIN",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DOG DEEP CLEAN SHAMPOO",
        "Sub Category New": "DOG DEEP CLEAN SHAMPOO_OS",
        "Category": "DOG DEEP CLEAN SHAMPOO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER KID SHOES",
        "Sub Category New": "LEATHER KID SHOES_27",
        "Category": "LEATHER KID SHOES",
        "Size": "27",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Soft Trolley Bag",
        "Sub Category New": "Soft Trolley Bag_OS",
        "Category": "Soft Trolley Bag",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU WOMEN BAG",
        "Sub Category New": "PU WOMEN BAG_OS",
        "Category": "PU WOMEN BAG",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "TOILETRY KIT",
        "Sub Category New": "TOILETRY KIT_OS",
        "Category": "TOILETRY KIT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PORTFOLIO",
        "Sub Category New": "PORTFOLIO_OS",
        "Category": "PORTFOLIO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET TOY",
        "Sub Category New": "PET TOY_OS",
        "Category": "PET TOY",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "HEADPHONE CASE",
        "Sub Category New": "HEADPHONE CASE_OS",
        "Category": "HEADPHONE CASE",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU MEN WALLET",
        "Sub Category New": "PU MEN WALLET_OS",
        "Category": "PU MEN WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU MEN STRAP",
        "Sub Category New": "PU MEN STRAP_40",
        "Category": "PU MEN STRAP",
        "Size": "40",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN REVERSIBLE BELT",
        "Sub Category New": "LEATHER MEN REVERSIBLE BELT_34",
        "Category": "LEATHER MEN REVERSIBLE BELT",
        "Size": "34",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "IPHONE 12/13 MOBILE COVER",
        "Sub Category New": "IPHONE 12/13 MOBILE COVER_OS",
        "Category": "IPHONE 12/13 MOBILE COVER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "IPHONE 12/13 PRO MAX MOBILE COVER",
        "Sub Category New": "IPHONE 12/13 PRO MAX MOBILE COVER_OS",
        "Category": "IPHONE 12/13 PRO MAX MOBILE COVER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER GLOVES",
        "Sub Category New": "LEATHER GLOVES_L",
        "Category": "LEATHER GLOVES",
        "Size": "L",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER JACKETS",
        "Sub Category New": "LEATHER JACKETS_3XL",
        "Category": "LEATHER JACKETS",
        "Size": "3XL",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU MEN BELT",
        "Sub Category New": "PU MEN BELT_34",
        "Category": "PU MEN BELT",
        "Size": "34",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU UNISEX BELT",
        "Sub Category New": "PU UNISEX BELT_34",
        "Category": "PU UNISEX BELT",
        "Size": "34",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "GLOVES",
        "Sub Category New": "GLOVES_OS",
        "Category": "GLOVES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "MASK",
        "Sub Category New": "MASK_OS",
        "Category": "MASK",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PPE KIT",
        "Sub Category New": "PPE KIT_OS",
        "Category": "PPE KIT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "SANITISER",
        "Sub Category New": "SANITISER_OS",
        "Category": "SANITISER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "AQUA SANTISER",
        "Sub Category New": "AQUA SANTISER_OS",
        "Category": "AQUA SANTISER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "COMBOS",
        "Sub Category New": "COMBOS_OS",
        "Category": "COMBOS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WALLET",
        "Sub Category New": "LEATHER WALLET_OS",
        "Category": "LEATHER WALLET",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DH SANTISER",
        "Sub Category New": "DH SANTISER_OS",
        "Category": "DH SANTISER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Men Jackets",
        "Sub Category New": "Teakwood Men Jackets_L",
        "Category": "Teakwood Men Jackets",
        "Size": "L",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU WOMEN JACKET",
        "Sub Category New": "PU WOMEN JACKET_L",
        "Category": "PU WOMEN JACKET",
        "Size": "L",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DELIST",
        "Sub Category New": "DELIST_OS",
        "Category": "DELIST",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "NECK PILLOW",
        "Sub Category New": "NECK PILLOW_OS",
        "Category": "NECK PILLOW",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU Jackets",
        "Sub Category New": "PU Jackets_L",
        "Category": "PU Jackets",
        "Size": "L",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER BELTS",
        "Sub Category New": "LEATHER BELTS_44",
        "Category": "LEATHER BELTS",
        "Size": "44",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Leathers Men Tan Brown Solid Belt-34-Tan",
        "Sub Category New": "Teakwood Leathers Men Tan Brown Solid Belt-34-Tan_34",
        "Category": "Teakwood Leathers Men Tan Brown Solid Belt-34-Tan",
        "Size": "34",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Leathers Men Tan Brown Solid Belt-36-Tan",
        "Sub Category New": "Teakwood Leathers Men Tan Brown Solid Belt-36-Tan_36",
        "Category": "Teakwood Leathers Men Tan Brown Solid Belt-36-Tan",
        "Size": "36",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Leathers Men Tan Brown Solid Belt-40-Tan",
        "Sub Category New": "Teakwood Leathers Men Tan Brown Solid Belt-40-Tan_40",
        "Category": "Teakwood Leathers Men Tan Brown Solid Belt-40-Tan",
        "Size": "40",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Watches",
        "Sub Category New": "Watches_ONE SIZE",
        "Category": "Watches",
        "Size": "ONE SIZE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Bags",
        "Sub Category New": "Bags_OS",
        "Category": "Bags",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BLT_WLT",
        "Sub Category New": "BLT_WLT_OS",
        "Category": "BLT_WLT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BELT_WLT",
        "Sub Category New": "BELT_WLT_OS",
        "Category": "BELT_WLT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "APSIS COMBO",
        "Sub Category New": "APSIS COMBO_OS",
        "Category": "APSIS COMBO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "TROLLEY SET",
        "Sub Category New": "TROLLEY SET_SET",
        "Category": "TROLLEY SET",
        "Size": "SET",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BELT& WLT",
        "Sub Category New": "BELT& WLT_OS",
        "Category": "BELT& WLT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "TEAKWOOD LEATHER",
        "Sub Category New": "TEAKWOOD LEATHER_OS",
        "Category": "TEAKWOOD LEATHER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "COMBO-5",
        "Sub Category New": "COMBO-5_OS",
        "Category": "COMBO-5",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "APSIS COMBO-2",
        "Sub Category New": "APSIS COMBO-2_OS",
        "Category": "APSIS COMBO-2",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Towel",
        "Sub Category New": "Towel_OS",
        "Category": "Towel",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Bag",
        "Sub Category New": "Bag_OS",
        "Category": "Bag",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Wipes",
        "Sub Category New": "Wipes_OS",
        "Category": "Wipes",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Sleeker",
        "Sub Category New": "Sleeker_L",
        "Category": "Sleeker",
        "Size": "L",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Comb",
        "Sub Category New": "Comb_OS",
        "Category": "Comb",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Leashes",
        "Sub Category New": "Leashes_OS",
        "Category": "Leashes",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Toy",
        "Sub Category New": "Toy_OS",
        "Category": "Toy",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Bows Collar",
        "Sub Category New": "Bows Collar_OS",
        "Category": "Bows Collar",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET COLLAR",
        "Sub Category New": "PET COLLAR_OS",
        "Category": "PET COLLAR",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET LEASHES",
        "Sub Category New": "PET LEASHES_OS",
        "Category": "PET LEASHES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET BOWS & TIES",
        "Sub Category New": "PET BOWS & TIES_OS",
        "Category": "PET BOWS & TIES",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET TRAINING PADS",
        "Sub Category New": "PET TRAINING PADS_OS",
        "Category": "PET TRAINING PADS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET BED",
        "Sub Category New": "PET BED_L",
        "Category": "PET BED",
        "Size": "L",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "FEEDING BOWL",
        "Sub Category New": "FEEDING BOWL_OS",
        "Category": "FEEDING BOWL",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "STRAP",
        "Sub Category New": "STRAP_OS",
        "Category": "STRAP",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DH_SANTISER",
        "Sub Category New": "DH_SANTISER_OS",
        "Category": "DH_SANTISER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BELT",
        "Sub Category New": "BELT_OS",
        "Category": "BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Face Shield",
        "Sub Category New": "Face Shield_OS",
        "Category": "Face Shield",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BUNDLE-1",
        "Sub Category New": "BUNDLE-1_OS",
        "Category": "BUNDLE-1",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DEFAULT",
        "Sub Category New": "DEFAULT_44",
        "Category": "DEFAULT",
        "Size": "44",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "WALLET",
        "Sub Category New": "WALLET_ONE SIZE",
        "Category": "WALLET",
        "Size": "ONE SIZE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "JACKET",
        "Sub Category New": "JACKET_L",
        "Category": "JACKET",
        "Size": "L",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "WOMEN BELT",
        "Sub Category New": "WOMEN BELT_30",
        "Category": "WOMEN BELT",
        "Size": "30",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET BRUSHES & COMBS-WOODEN PIN BRUSH",
        "Sub Category New": "PET BRUSHES & COMBS-WOODEN PIN BRUSH_OS",
        "Category": "PET BRUSHES & COMBS-WOODEN PIN BRUSH",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET SCOOPER",
        "Sub Category New": "PET SCOOPER_OS",
        "Category": "PET SCOOPER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET LEASHES-IRON CHAIN LEASH",
        "Sub Category New": "PET LEASHES-IRON CHAIN LEASH_OS",
        "Category": "PET LEASHES-IRON CHAIN LEASH",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET GROOMING TOOLS",
        "Sub Category New": "PET GROOMING TOOLS_OS",
        "Category": "PET GROOMING TOOLS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET DIAPERS",
        "Sub Category New": "PET DIAPERS_L",
        "Category": "PET DIAPERS",
        "Size": "L",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "CARD HOLDER",
        "Sub Category New": "CARD HOLDER_OS",
        "Category": "CARD HOLDER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "COMBO-2",
        "Sub Category New": "COMBO-2_OS",
        "Category": "COMBO-2",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET COMBO- 1",
        "Sub Category New": "PET COMBO- 1_OS",
        "Category": "PET COMBO- 1",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU SWACH",
        "Sub Category New": "PU SWACH_OS",
        "Category": "PU SWACH",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "CATALOGUE",
        "Sub Category New": "CATALOGUE_OS",
        "Category": "CATALOGUE",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET TRAVEL ACC",
        "Sub Category New": "PET TRAVEL ACC_S",
        "Category": "PET TRAVEL ACC",
        "Size": "S",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BUCKLE & STRAP",
        "Sub Category New": "BUCKLE & STRAP_OS",
        "Category": "BUCKLE & STRAP",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PET LEASH & COLLAR",
        "Sub Category New": "PET LEASH & COLLAR_M",
        "Category": "PET LEASH & COLLAR",
        "Size": "M",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU BELTS",
        "Sub Category New": "PU BELTS_28",
        "Category": "PU BELTS",
        "Size": "28",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Full-Sleeve Leather Jacket",
        "Sub Category New": "Black Full-Sleeve Leather Jacket_L",
        "Category": "Black Full-Sleeve Leather Jacket",
        "Size": "L",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Textured Tri-fold Leather Wallets",
        "Sub Category New": "Brown Textured Tri-fold Leather Wallets_FREE",
        "Category": "Brown Textured Tri-fold Leather Wallets",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Full-Sleeve Leather Biker Jacket",
        "Sub Category New": "Brown Full-Sleeve Leather Biker Jacket_M",
        "Category": "Brown Full-Sleeve Leather Biker Jacket",
        "Size": "M",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Charcoal Grey Full-Sleeve Leather Biker Jacket",
        "Sub Category New": "Charcoal Grey Full-Sleeve Leather Biker Jacket_M",
        "Category": "Charcoal Grey Full-Sleeve Leather Biker Jacket",
        "Size": "M",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Tan Brown Full-Sleeve Leather Jacket",
        "Sub Category New": "Tan Brown Full-Sleeve Leather Jacket_S",
        "Category": "Tan Brown Full-Sleeve Leather Jacket",
        "Size": "S",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Solid Three Fold Leather Wallet",
        "Sub Category New": "Black Solid Three Fold Leather Wallet_FREE",
        "Category": "Black Solid Three Fold Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Bi Fold Leather Wallet",
        "Sub Category New": "Brown Bi Fold Leather Wallet_FREE",
        "Category": "Brown Bi Fold Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Full-Sleeve Leather Jacket",
        "Sub Category New": "Brown Full-Sleeve Leather Jacket_S",
        "Category": "Brown Full-Sleeve Leather Jacket",
        "Size": "S",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Leather Full-Sleeve Biker Jacket",
        "Sub Category New": "Brown Leather Full-Sleeve Biker Jacket_S",
        "Category": "Brown Leather Full-Sleeve Biker Jacket",
        "Size": "S",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Two Fold Leather Wallet",
        "Sub Category New": "Brown Two Fold Leather Wallet_FREE",
        "Category": "Brown Two Fold Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Two-fold Leather Wallet",
        "Sub Category New": "Brown Two-fold Leather Wallet_FREE",
        "Category": "Brown Two-fold Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Leather Two Fold Wallet",
        "Sub Category New": "Black Leather Two Fold Wallet_FREE",
        "Category": "Black Leather Two Fold Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Textured Leather Wallet",
        "Sub Category New": "Brown Textured Leather Wallet_FREE",
        "Category": "Brown Textured Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Textured Two-fold Leather Wallet",
        "Sub Category New": "Black Textured Two-fold Leather Wallet_FREE",
        "Category": "Black Textured Two-fold Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Leather Two Fold Wallet",
        "Sub Category New": "Brown Leather Two Fold Wallet_FREE",
        "Category": "Brown Leather Two Fold Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Blue & Off-White Colourblocked Two Fold Leather Wallet",
        "Sub Category New": "Blue & Off-White Colourblocked Two Fold Leather Wallet_FREE",
        "Category": "Blue & Off-White Colourblocked Two Fold Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Blue Full-Sleeve Leather Jacket",
        "Sub Category New": "Blue Full-Sleeve Leather Jacket_S",
        "Category": "Blue Full-Sleeve Leather Jacket",
        "Size": "S",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Blue Textured Two-fold Leather Wallet",
        "Sub Category New": "Blue Textured Two-fold Leather Wallet_FREE",
        "Category": "Blue Textured Two-fold Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Textured Two Fold Leather Wallet",
        "Sub Category New": "Brown Textured Two Fold Leather Wallet_FREE",
        "Category": "Brown Textured Two Fold Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Three-fold Leather Wallet",
        "Sub Category New": "Brown Three-fold Leather Wallet_FREE",
        "Category": "Brown Three-fold Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Navy Blue Two Fold Leather Wallet",
        "Sub Category New": "Navy Blue Two Fold Leather Wallet_FREE",
        "Category": "Navy Blue Two Fold Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Colourblocked Two Fold Leather Wallet",
        "Sub Category New": "Brown Colourblocked Two Fold Leather Wallet_FREE",
        "Category": "Brown Colourblocked Two Fold Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Tan Brown Textured Two Fold Leather Wallet",
        "Sub Category New": "Tan Brown Textured Two Fold Leather Wallet_FREE",
        "Category": "Tan Brown Textured Two Fold Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Textured Two-fold Leather Wallet",
        "Sub Category New": "Brown Textured Two-fold Leather Wallet_FREE",
        "Category": "Brown Textured Two-fold Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Navy Blue Leather Two Fold Wallet",
        "Sub Category New": "Navy Blue Leather Two Fold Wallet_FREE",
        "Category": "Navy Blue Leather Two Fold Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Full-Sleeve Printed Leather Jacket",
        "Sub Category New": "Brown Full-Sleeve Printed Leather Jacket_S",
        "Category": "Brown Full-Sleeve Printed Leather Jacket",
        "Size": "S",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Full-Sleeve Leather Biker Jacket",
        "Sub Category New": "Black Full-Sleeve Leather Biker Jacket_S",
        "Category": "Black Full-Sleeve Leather Biker Jacket",
        "Size": "S",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Brown Full-Sleeve Water Resistant Leather Jacket",
        "Sub Category New": "Brown Full-Sleeve Water Resistant Leather Jacket_S",
        "Category": "Brown Full-Sleeve Water Resistant Leather Jacket",
        "Size": "S",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Textured Leather Wallet",
        "Sub Category New": "Black Textured Leather Wallet_FREE",
        "Category": "Black Textured Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Two Fold Leather Wallet",
        "Sub Category New": "Black Two Fold Leather Wallet_FREE",
        "Category": "Black Two Fold Leather Wallet",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Olive Green Striped Full-Sleeve Leather Biker Jacket",
        "Sub Category New": "Olive Green Striped Full-Sleeve Leather Biker Jacket_XXL",
        "Category": "Olive Green Striped Full-Sleeve Leather Biker Jacket",
        "Size": "XXL",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Blue Full-Sleeve Leather Biker Jacket",
        "Sub Category New": "Blue Full-Sleeve Leather Biker Jacket_S",
        "Category": "Blue Full-Sleeve Leather Biker Jacket",
        "Size": "S",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Tan Full Sleeve Leather Biker Jacket",
        "Sub Category New": "Tan Full Sleeve Leather Biker Jacket_S",
        "Category": "Tan Full Sleeve Leather Biker Jacket",
        "Size": "S",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Leather Slippers",
        "Sub Category New": "Black Leather Slippers_UK 8",
        "Category": "Black Leather Slippers",
        "Size": "UK 8",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Synthetic Leather Slippers",
        "Sub Category New": "Black Synthetic Leather Slippers_UK 6",
        "Category": "Black Synthetic Leather Slippers",
        "Size": "UK 6",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Blue Synthetic Leather Sneakers",
        "Sub Category New": "Blue Synthetic Leather Sneakers_UK 6",
        "Category": "Blue Synthetic Leather Sneakers",
        "Size": "UK 6",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Tan Brown Leather Slippers",
        "Sub Category New": "Tan Brown Leather Slippers_UK 6",
        "Category": "Tan Brown Leather Slippers",
        "Size": "UK 6",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Black Solid Leather Card Holder",
        "Sub Category New": "Black Solid Leather Card Holder_FREE",
        "Category": "Black Solid Leather Card Holder",
        "Size": "FREE",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DIARY",
        "Sub Category New": "DIARY_Small",
        "Category": "DIARY",
        "Size": "Small",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LOGO",
        "Sub Category New": "LOGO_OS",
        "Category": "LOGO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PULLER",
        "Sub Category New": "PULLER_OS",
        "Category": "PULLER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN STRAP",
        "Sub Category New": "LEATHER WOMEN STRAP_OS",
        "Category": "LEATHER WOMEN STRAP",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BELTS",
        "Sub Category New": "BELTS_OS",
        "Category": "BELTS",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Leathers Women Brown Genuine Leather Belt ()",
        "Sub Category New": "Teakwood Leathers Women Brown Genuine Leather Belt ()_OS",
        "Category": "Teakwood Leathers Women Brown Genuine Leather Belt ()",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Leathers Women Casual Brown Genuine Leather Belt ()",
        "Sub Category New": "Teakwood Leathers Women Casual Brown Genuine Leather Belt ()_OS",
        "Category": "Teakwood Leathers Women Casual Brown Genuine Leather Belt ()",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Leathers Women Casual Tan Genuine Leather Belt ()",
        "Sub Category New": "Teakwood Leathers Women Casual Tan Genuine Leather Belt ()_OS",
        "Category": "Teakwood Leathers Women Casual Tan Genuine Leather Belt ()",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DOG HAIRFALL CONTROL SHAMPOO",
        "Sub Category New": "DOG HAIRFALL CONTROL SHAMPOO_OS",
        "Category": "DOG HAIRFALL CONTROL SHAMPOO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DOG DEEP MOISTURIZING SHAMPOO",
        "Sub Category New": "DOG DEEP MOISTURIZING SHAMPOO_OS",
        "Category": "DOG DEEP MOISTURIZING SHAMPOO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DOG ANTI TICK & FLEA SHAMPOO",
        "Sub Category New": "DOG ANTI TICK & FLEA SHAMPOO_OS",
        "Category": "DOG ANTI TICK & FLEA SHAMPOO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DOG DRY SHAMPOO",
        "Sub Category New": "DOG DRY SHAMPOO_OS",
        "Category": "DOG DRY SHAMPOO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "IPHONE 12/13 PRO MOBILE COVER",
        "Sub Category New": "IPHONE 12/13 PRO MOBILE COVER_OS",
        "Category": "IPHONE 12/13 PRO MOBILE COVER",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "AIRPOD CASE",
        "Sub Category New": "AIRPOD CASE_OS",
        "Category": "AIRPOD CASE",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "PU WOMEN SHOES",
        "Sub Category New": "PU WOMEN SHOES_36",
        "Category": "PU WOMEN SHOES",
        "Size": "36",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BAD SKU",
        "Sub Category New": "BAD SKU_OS",
        "Category": "BAD SKU",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DOG MAT",
        "Sub Category New": "DOG MAT_OS",
        "Category": "DOG MAT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "WOMEN BUCKLE",
        "Sub Category New": "WOMEN BUCKLE_OS",
        "Category": "WOMEN BUCKLE",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER WOMEN REVERSIBLE BELT",
        "Sub Category New": "LEATHER WOMEN REVERSIBLE BELT_OS",
        "Category": "LEATHER WOMEN REVERSIBLE BELT",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "BELT & WALLET COMBO",
        "Sub Category New": "BELT & WALLET COMBO_OS",
        "Category": "BELT & WALLET COMBO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "COMBO",
        "Sub Category New": "COMBO_OS",
        "Category": "COMBO",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "COOM",
        "Sub Category New": "COOM_OS",
        "Category": "COOM",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Teakwood Leathers Brown Casual Belt for Women",
        "Sub Category New": "Teakwood Leathers Brown Casual Belt for Women_beltsizefashiona75cmsl30inch",
        "Category": "Teakwood Leathers Brown Casual Belt for Women",
        "Size": "beltsizefashiona75cmsl30inch",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "TEAKWOOD _ Men Genuine Leather Peshwar Sandal_Size 6 Brown",
        "Sub Category New": "TEAKWOOD _ Men Genuine Leather Peshwar Sandal_Size 6 Brown_OS",
        "Category": "TEAKWOOD _ Men Genuine Leather Peshwar Sandal_Size 6 Brown",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "DOG JACKET",
        "Sub Category New": "DOG JACKET_M",
        "Category": "DOG JACKET",
        "Size": "M",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Apsis Women Black Textured Casual Belt",
        "Sub Category New": "Apsis Women Black Textured Casual Belt_OS",
        "Category": "Apsis Women Black Textured Casual Belt",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Apsis Women Black & Gold-Toned Belt",
        "Sub Category New": "Apsis Women Black & Gold-Toned Belt_OS",
        "Category": "Apsis Women Black & Gold-Toned Belt",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Apsis Women Black Slim Belt",
        "Sub Category New": "Apsis Women Black Slim Belt_OS",
        "Category": "Apsis Women Black Slim Belt",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "Apsis Women Black Solid Belt",
        "Sub Category New": "Apsis Women Black Solid Belt_OS",
        "Category": "Apsis Women Black Solid Belt",
        "Size": "OS",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "KIDS SCHOOL BAG",
        "Sub Category New": "KIDS SCHOOL BAG_14\"",
        "Category": "KIDS SCHOOL BAG",
        "Size": "14\"",
        "Ratio": "1",
        "Ratio Sum": "1"
    },
    {
        "Sub Category": "LEATHER MEN AUTOLOCK BELT",
        "Sub Category New": "LEATHER MEN AUTOLOCK BELT_34",
        "Category": "LEATHER MEN AUTOLOCK BELT",
        "Size": "34",
        "Ratio": "1",
        "Ratio Sum": "1"
    }
]