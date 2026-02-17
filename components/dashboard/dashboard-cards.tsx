import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analysisDasboard } from "@/action/csv"
import { BarChart3, IndianRupee } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export async function DashboardCards() {
  const { cards, unlink_sku_card } = await analysisDasboard()
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Object.entries(cards).map(([label, data]) => (
        <Link key={label} href={`/monthly-report/analysis/${label.toLocaleLowerCase().replaceAll(" ", "-")}`}>
          <AnalysisCard label={label} count={data.count} amount={data.totalValue} />
        </Link>
      ))}
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
}: {
  label: string
  count?: number
  amount?: number
}) {
  return (
    <Card className="transition-all duration-300 ease-in-out transform hover:scale-105">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count?.toLocaleString()}</div>
        {amount && <p className="text-xs text-muted-foreground flex items-center mt-1">
          <IndianRupee className="h-3 w-3 mr-1" />
          {amount?.toLocaleString()}
        </p>}
      </CardContent>
    </Card>
  )
}

