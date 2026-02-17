"use client"

import { Bar, BarChart, CartesianGrid, XAxis, Text } from "recharts"

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
import Link from "next/link"

type BarChartProps = {
  data?: {
    sale_value: number;
    sale_percentage: number;
    grade: string;
  }[]
}

const chartConfig = {
  saleValue: {
    label: "Sales Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

// Custom label component for the bars
const CustomBarLabel = ({ x, y, width, index, data }: {
  x?: number;
  y?: number;
  width?: number;
  index?: number;
  data?: {
    grade: string;
    saleValue: number;
    percentage: number;
  }[];
}) => {
  if (x === undefined || y === undefined || width === undefined || index === undefined || !data) {
    return null;
  }

  const percentage = data[index]?.percentage;

  return (
    <Text
      x={x + width / 2}
      y={y - 10}
      fill="#666"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={12}
    >
      {`${percentage}%`}
    </Text>
  );
};

export function SalesBarChart({ data = [] }: BarChartProps) {
  // Transform data for the chart
  const chartData = data?.map((item) => ({
    grade: item.grade,
    saleValue: item.sale_value,
    percentage: Math.abs(item.sale_percentage),
  }))

  return (
    <Card className="h-full">
      <Link href={`/monthly-report/analysis/sales-Summary`}>
        <CardHeader>
          <CardTitle>Sales Analysis (Month Wise)</CardTitle>
          <CardDescription>Sales value by grade</CardDescription>
        </CardHeader>
      </Link>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
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
            <Bar
              dataKey="saleValue"
              fill="var(--color-saleValue)"
              radius={4}
              label={(props) => <CustomBarLabel {...props} data={chartData} />}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {/* <div className="flex gap-2 font-medium leading-none">
          {data?.length > 0 && (
            <>
              Sales trending {data[0].sale_percentage > 0 ? "up" : "down"} by{" "}
              {Math.abs(data[0].sale_percentage)}% <TrendingUp className="h-4 w-4" />
            </>
          )}
        </div> */}
        {/* <div className="leading-none text-muted-foreground">
          Showing sales values by grade
        </div> */}
      </CardFooter>
    </Card>
  )
}