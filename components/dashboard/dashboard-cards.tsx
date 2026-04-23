import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analysisDasboard } from "@/action/csv"
import { BarChart3, IndianRupee } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export async function DashboardCards() {
  const { cards, unlink_sku_card, openSalesValueSummary } = await analysisDasboard()
// const disabledNavigationCards = new Set(["open purchase", "open sales value"])
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Object.entries(cards).map(([label, data]) => {
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
            />
          </Link>
        )
      })}
      <Link key={"Unlink SKU Card"} href={`/channel-report`}>
        <AnalysisCard label={"Unlink SKU Card"} count={unlink_sku_card || 0} />
      </Link>
    </div>
  )
}

function AnalysisCard({
  label,
  count,
  amount,
  openSalesValueSummary,
}: {
  label: string
  count?: number
  amount?: number
  openSalesValueSummary?: {
    totalQuantity: number
    totalInvoiceTotal: number
  }
}) {
  const isOpenSalesValueCard = label.toLowerCase().trim() === "open sales value"
  const showPartitionedOpenSalesView = isOpenSalesValueCard && openSalesValueSummary
  const cardTitle = isOpenSalesValueCard ? "Monthly Open Sales Value" : label

  return (
    <Card className="transition-all duration-300 ease-in-out transform hover:scale-105">
      {showPartitionedOpenSalesView ? (
        <CardHeader className="pb-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Monthly Open Sales Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between border-l pl-4">
              <CardTitle className="text-sm font-medium">Daily Open Sales Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
      ) : (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{cardTitle}</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
      )}
      <CardContent>
        {showPartitionedOpenSalesView ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold">{count?.toLocaleString()}</div>
              {amount && <p className="text-xs text-muted-foreground flex items-center mt-1">
                <IndianRupee className="h-3 w-3 mr-1" />
                {amount?.toLocaleString()}
              </p>}
            </div>

            <div className="border-l pl-4">
              <div className="text-2xl font-bold">{openSalesValueSummary.totalQuantity.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <IndianRupee className="h-3 w-3 mr-1" />
                {openSalesValueSummary.totalInvoiceTotal.toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{count?.toLocaleString()}</div>
            {amount && <p className="text-xs text-muted-foreground flex items-center mt-1">
              <IndianRupee className="h-3 w-3 mr-1" />
              {amount?.toLocaleString()}
            </p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}

