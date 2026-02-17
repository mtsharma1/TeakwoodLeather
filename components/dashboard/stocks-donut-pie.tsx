"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

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
} from "@/components/ui/chart"
import { formatLargeCurrency, roundToDecimals, safeNumber } from "@/lib/utils"

type CardsData = {
  'Over Stock': {
    count: number;
    totalValue: number;
  };
  'Under Stock': {
    count: number;
    totalValue: number;
  };
  'Under Price 2': {
    count: number;
    totalValue: number;
  };
  'New Grade': {
    count: number;
    totalValue: number;
  };
  'Common Order Summary': {
    count: number;
    totalValue: number;
  };
  'Order Summary Sheet': {
    count: number;
    totalValue: number;
  };
}

const COLORS = {
  'Over Stock': 'hsl(var(--chart-1))',
  'Under Stock': 'hsl(var(--chart-2))',
  'Under Price 2': 'hsl(var(--chart-3))',
  'New Grade': 'hsl(var(--chart-4))',
  'Common Order Summary': 'hsl(var(--chart-5))',
  'Order Summary Sheet': 'hsl(var(--chart-6))'
}

export function MonthlyReportDonutPieChart({ data }: { data: CardsData }) {
  // Transform data for the chart with proper rounding
  const chartData = React.useMemo(() => {
    return Object.entries(data).map(([category, values]) => ({
      category,
      value: roundToDecimals(safeNumber(values.totalValue)),
      fill: COLORS[category as keyof typeof COLORS]
    }))
  }, [data])

  // Calculate total value with proper rounding
  const totalValue = React.useMemo(() => {
    return roundToDecimals(
      Object.values(data).reduce((acc, curr) =>
        acc + safeNumber(curr.totalValue),
        0
      ))
  }, [data])

  // Create chart config
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      value: { label: "Value" }
    }

    Object.entries(COLORS).forEach(([category, color]) => {
      config[category] = {
        label: category,
        color: color
      }
    })

    return config
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Stock and Order Summary</CardTitle>
        <CardDescription>Total Value Distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              content={({ payload }) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload
                  return (
                    <div className="p-2 bg-white rounded shadow">
                      <div className="font-medium">{data.category}</div>
                      <div>{formatLargeCurrency(data.value)}</div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={2}
              stroke="#fff"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {formatLargeCurrency(totalValue)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-sm"
                        >
                          Total Value
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-4">
        <div className="grid grid-cols-2 gap-2 w-full text-sm">
          {Object.entries(data).map(([category, values]) => {
            const roundedValue = roundToDecimals(safeNumber(values.totalValue));
            const percentage = roundToDecimals((roundedValue / totalValue) * 100);
            return (
              <div key={category} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[category as keyof typeof COLORS] }}
                />
                <span className="text-muted-foreground">
                  {category}: {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </CardFooter>
    </Card>
  )
}

export default MonthlyReportDonutPieChart