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
    inventory_value: number;
    inventory_percentage: number;
    grade: string;
  }[]
}

const chartConfig = {
  inventoryValue: {
    label: "Inventory Count",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const CustomBarLabel = ({ x, y, width, index, data }: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
  index?: number;
  data?: {
    grade: string;
    inventoryValue: number;
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

export function InventoryBarChart({ data = [] }: BarChartProps) {
  const chartData = data?.map((item) => ({
    grade: item.grade,
    inventoryValue: item.inventory_value,
    percentage: Math.abs(item.inventory_percentage)
  }))

  return (
    <Card className="h-full">
      <Link href={'/monthly-report/analysis/inventory-mis'}>
        <CardHeader>
          <CardTitle>Inventory Analysis (Month Wise)</CardTitle>
          <CardDescription>Inventory count by grade</CardDescription>
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
              dataKey="inventoryValue"
              fill="var(--color-inventoryValue)"
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
              Inventory trending {data[0].inventory_percentage > 0 ? "up" : "down"} by{" "}
              {Math.abs(data[0].inventory_percentage)}% <TrendingUp className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing inventory values by grade
        </div> */}
      </CardFooter>
    </Card>
  )
}