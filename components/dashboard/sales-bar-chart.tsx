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
    saleValue: number
    salePercentage: number
    grade: string
  }[]
}

const chartConfig = {
  saleValue: {
    label: "Sales Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function SalesBarChart({ data = [] }: BarChartProps) {
  // Transform data for the chart
  const chartData = data?.map((item) => ({
    grade: item.grade,
    saleValue: item.saleValue,
  }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Sales Analysis</CardTitle>
        <CardDescription>Sales value by grade</CardDescription>
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
            <Bar dataKey="saleValue" fill="var(--color-saleValue)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {data?.length > 0 && (
            <>
              Sales trending {data[0].salePercentage > 0 ? "up" : "down"} by{" "}
              {Math.abs(data[0].salePercentage)}% <TrendingUp className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing sales values by grade
        </div>
      </CardFooter>
    </Card>
  )
}