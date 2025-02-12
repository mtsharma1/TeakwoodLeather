import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analysisDasboard } from "@/action/csv"
import { BarChart3, IndianRupee } from "lucide-react"

export const dynamic = 'force-dynamic'

export async function DashboardCards() {
  const { cards } = await analysisDasboard()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Object.entries(cards).map(([label, data]) => (
        <AnalysisCard key={label} label={label} count={data.count} amount={data.totalValue} />
      ))}
    </div>
  )
}

function AnalysisCard({
  label,
  count,
  amount,
}: {
  label: string
  count: number
  amount: number
}) {
  return (
    <Card className="transition-all duration-300 ease-in-out transform hover:scale-105">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          <IndianRupee className="h-3 w-3 mr-1" />
          {amount.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  )
}

