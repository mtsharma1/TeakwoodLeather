import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analysisDasboard } from "@/action/csv"
import { BarChart3, IndianRupee } from "lucide-react"
import Link from "next/link"
import { auth } from "@/auth"

export const dynamic = 'force-dynamic'

type MenuNode = {
  url: string
  items?: MenuNode[]
}

const dashboardMenuTree: MenuNode[] = [
  {
    url: "/",
  },
  {
    url: "/monthly-report",
    items: [
      {
        url: "/monthly-report/raw-data",
      },
      {
        url: "/monthly-report/analysis",
        items: [
          { url: "/monthly-report/analysis/over-stock" },
          { url: "/monthly-report/analysis/under-stock" },
          { url: "/monthly-report/analysis/under-price-2" },
          { url: "/monthly-report/analysis/open-purchase" },
          { url: "/monthly-report/analysis/open-sales-value" },
          { url: "/monthly-report/analysis/sales-Summary" },
          { url: "/monthly-report/analysis/inventory-mis" },
          { url: "/monthly-report/analysis/common-order-summary" },
          { url: "/monthly-report/analysis/order-summary" },
          { url: "/monthly-report/analysis/new-grade" },
          {
            url: "/monthly-report/analysis/return",
            items: [
              { url: "/monthly-report/analysis/return-courier" },
              { url: "/monthly-report/analysis/return-reverse" },
            ],
          },
        ],
      },
      {
        url: "/monthly-report/category",
        items: [
          { url: "/monthly-report/category/mens-shoes" },
          { url: "/monthly-report/category/women-shoes" },
          { url: "/monthly-report/category/kids-shoes" },
          { url: "/monthly-report/category/leather-jackets" },
          { url: "/monthly-report/category/leather-men-casual-belt" },
          { url: "/monthly-report/category/other-category" },
        ],
      },
    ],
  },
  {
    url: "/price-checklist/overview",
  },
  {
    url: "/category-poral",
    items: [
      { url: "/category-poral/raw-data" },
      { url: "/category-poral/yesterday" },
      { url: "/category-poral/today" },
      { url: "/category-poral/report/poral" },
      { url: "/category-poral/report/category" },
      { url: "/category-poral/monthly-report" },
    ],
  },
  {
    url: "/channel-report",
  },
]

function countMenuAndSubmenuItems(nodes: MenuNode[]): number {
  return nodes.reduce((total, node) => {
    const childrenCount = node.items ? countMenuAndSubmenuItems(node.items) : 0
    return total + 1 + childrenCount
  }, 0)
}

export async function DashboardCards() {
  const session = await auth()
  const { cards, unlink_sku_card, openSalesValueSummary } = await analysisDasboard()
  const cardEntries = Object.entries(cards)
  const firstName = session?.user?.name?.split(" ")[0] || "Jonathan"
  const pendingReturns = cardEntries.find(([label]) => label.toLowerCase().trim() === "pending return")?.[1]?.count ?? 0
  const totalMenuAndSubmenuItems = countMenuAndSubmenuItems(dashboardMenuTree)

// const disabledNavigationCards = new Set(["open purchase", "open sales value"])
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-none border border-[#ced6e3] bg-white shadow-none">
          <CardContent className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[2rem] leading-none text-[#2f3748]">
                  Welcome <span className="font-semibold text-[#4458b8]">{firstName}</span>
                </p>
                <p className="mt-3 text-sm tracking-[0.04em] text-[#788193]">Number Of Reports</p>
              </div>
              <p className="text-[2.1rem] font-semibold text-[#2a303d]">{totalMenuAndSubmenuItems}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border border-[#ced6e3] bg-white shadow-none">
          <CardContent className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[2rem] leading-none text-[#2f3748]">Pending Returns</p>
                <p className="mt-3 text-sm tracking-[0.04em] text-[#788193]">Courier/Reverse</p>
              </div>
              <p className="text-[2.1rem] font-semibold text-[#2a303d]">{pendingReturns.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cardEntries.map(([label, data], index) => {
        const normalizedLabel = label.toLocaleLowerCase().trim()
        const isNavigationDisabled = normalizedLabel === "pending return"

      //  const isNavigationDisabled = disabledNavigationCards.has(normalizedLabel)

      //   if (isNavigationDisabled) {
      //     return <AnalysisCard key={label} label={label} count={data.count} amount={data.totalValue} />
      //   }
        

        if (isNavigationDisabled) {
          return (
            <AnalysisCard
              key={label}
              label={label}
              count={data.count}
              amount={data.totalValue}
              colorIndex={index}
            />
          )
        }

        return (
          <Link key={label} href={`/monthly-report/analysis/${normalizedLabel.replaceAll(" ", "-")}`} className="block">
            <AnalysisCard
              label={label}
              count={data.count}
              amount={data.totalValue}
              openSalesValueSummary={normalizedLabel === "open sales value" ? openSalesValueSummary : undefined}
              colorIndex={index}
            />
          </Link>
        )
      })}
      <Link key={"Unlink SKU Card"} href={`/channel-report`}>
        <AnalysisCard label={"Unlink SKU Card"} count={unlink_sku_card || 0} colorIndex={cardEntries.length} />
      </Link>
      </div>
    </div>
  )
}

function AnalysisCard({
  label,
  count,
  amount,
  openSalesValueSummary,
  colorIndex = 0,
}: {
  label: string
  count?: number
  amount?: number
  openSalesValueSummary?: {
    totalQuantity: number
    totalInvoiceTotal: number
  }
  colorIndex?: number
}) {
  const isOpenSalesValueCard = label.toLowerCase().trim() === "open sales value"
  const showPartitionedOpenSalesView = isOpenSalesValueCard && openSalesValueSummary
  const cardTitle = isOpenSalesValueCard ? "Monthly Open Sales Value" : label
  const formattedCount = count?.toLocaleString() ?? "0"
  const colorThemes = [
    { value: "text-[#4458b8]", strip: "bg-[#4458b8]" },
    { value: "text-[#f1541a]", strip: "bg-[#f1541a]" },
    { value: "text-[#4caf50]", strip: "bg-[#4caf50]" },
    { value: "text-[#f5a10a]", strip: "bg-[#f5a10a]" },
  ]
  const theme = colorThemes[colorIndex % colorThemes.length]

  return (
    <Card className="relative flex h-full min-h-[162px] flex-col overflow-hidden rounded-none border border-[#ced6e3] bg-white shadow-none transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-[#8fb0e6] hover:shadow-[0_6px_16px_-10px_rgba(37,99,235,0.45)]">
      {showPartitionedOpenSalesView ? (
        <>
          <CardHeader className="pb-1 pt-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <CardTitle className="text-[0.9rem] font-medium tracking-[0.04em] text-[#596272]">Monthly Open Sales Value</CardTitle>
              </div>
              <div className="flex items-center border-l border-[#e7ebf2] pl-4">
                <CardTitle className="text-[0.9rem] font-medium tracking-[0.04em] text-[#596272]">Daily Open Sales Value</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={`text-[2.15rem] leading-none font-semibold ${theme.value}`}>{formattedCount}</div>
                {amount && <p className="text-[0.8rem] text-[#8992a3] flex items-center mt-2">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  {amount?.toLocaleString()}
                </p>}
              </div>

              <div className="border-l border-[#e7ebf2] pl-4">
                <div className={`text-[2.15rem] leading-none font-semibold ${theme.value}`}>{openSalesValueSummary.totalQuantity.toLocaleString()}</div>
                <p className="text-[0.8rem] text-[#8992a3] flex items-center mt-2">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  {openSalesValueSummary.totalInvoiceTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
          <div className={`flex h-12 items-center justify-end px-5 text-white ${theme.strip}`}>
            <BarChart3 className="h-5 w-5 opacity-95" />
          </div>
        </>
      ) : (
        <>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 pt-5">
            <CardTitle className="text-[0.9rem] font-medium tracking-[0.04em] text-[#596272]">{cardTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-6">
            <div className={`text-[2.15rem] leading-none font-semibold ${theme.value}`}>{formattedCount}</div>
            {amount && <p className="text-[0.8rem] text-[#8992a3] flex items-center mt-2">
              <IndianRupee className="h-3 w-3 mr-1" />
              {amount?.toLocaleString()}
            </p>}
          </CardContent>
          <div className={`flex h-12 items-center justify-end px-5 text-white ${theme.strip}`}>
            <BarChart3 className="h-5 w-5 opacity-95" />
          </div>
        </>
      )}
    </Card>
  )
}

