"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type BarChartProps = {
  data?: {
    inventoryValue: number
    inventoryPercentage: number
    grade: string
  }[]
}

const chartConfig = {
  inventoryValue: {
    label: "Inventory Value",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function InventoryBarChart({ data = [] }: BarChartProps) {
  // Transform data for the chart
  const chartData = data?.map((item) => ({
    grade: item.grade,
    inventoryValue: item.inventoryValue,
  }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Inventory Analysis</CardTitle>
        <CardDescription>Inventory value by grade</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="grade"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="inventoryValue" fill="var(--color-inventoryValue)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {data?.length > 0 && (
            <>
              Inventory trending {data[0].inventoryPercentage > 0 ? "up" : "down"} by{" "}
              {Math.abs(data[0].inventoryPercentage)}% <TrendingUp className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing inventory values by grade
        </div>
      </CardFooter>
    </Card>
  )
}