"use client"
import { ChartColumnIncreasingIcon, DollarSign, LucideProps } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { LineChartComponent } from "../line-chat"
import { BarChartComponent } from "../bar-chat"
import { DonutPieChartComponent } from "../donut-pie-chart"
import { ForwardRefExoticComponent, RefAttributes } from "react"

export const DashboardPage = () => {
    const DATA = [
        {
            label: "Total Revenue",
            description: "A card showing the total revenue in USD and the percentage difference from last month",
            count: "1,02,890",
            amt: "1,02,890",
            color: "bg-red-500",
            href: "/",
            icon: ChartColumnIncreasingIcon
        },
        {
            label: "Total Revenue",
            description: "A card showing the total revenue in USD and the percentage difference from last month",
            count: "1,02,890",
            amt: "1,02,890",
            color: "bg-red-500",
            href: "/",
            icon: ChartColumnIncreasingIcon
        },
        {
            label: "Total Revenue",
            description: "A card showing the total revenue in USD and the percentage difference from last month",
            count: "1,02,890",
            amt: "1,02,890",
            color: "bg-red-500",
            href: "/",
            icon: ChartColumnIncreasingIcon
        },
        {
            label: "Total Revenue",
            description: "A card showing the total revenue in USD and the percentage difference from last month",
            count: "1,02,890",
            amt: "1,02,890",
            color: "bg-red-500",
            href: "/",
            icon: ChartColumnIncreasingIcon
        },
        {
            label: "Total Revenue",
            description: "A card showing the total revenue in USD and the percentage difference from last month",
            count: "1,02,890",
            amt: "1,02,890",
            color: "bg-red-500",
            href: "/",
            icon: ChartColumnIncreasingIcon
        },
        {
            label: "Total Revenue",
            description: "A card showing the total revenue in USD and the percentage difference from last month",
            count: "1,02,890",
            amt: "1,02,890",
            color: "bg-red-500",
            href: "/",
            icon: ChartColumnIncreasingIcon
        },
        {
            label: "Total Revenue",
            description: "A card showing the total revenue in USD and the percentage difference from last month",
            count: "1,02,890",
            amt: "1,02,890",
            color: "bg-red-500",
            href: "/",
            icon: ChartColumnIncreasingIcon
        },
        {
            label: "Total Revenue",
            description: "A card showing the total revenue in USD and the percentage difference from last month",
            count: "1,02,890",
            amt: "1,02,890",
            color: "bg-red-500",
            href: "/",
            icon: ChartColumnIncreasingIcon
        },
    ]
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                {
                    DATA.map((x, idx) => <AnalysisCard {...x} key={idx} />)
                }
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <BarChartComponent />
                </div>
                <div>
                    <LineChartComponent />
                </div>
                <div>
                    <DonutPieChartComponent />
                </div>
            </div>
        </div>

    )
}


const AnalysisCard = ({
    description,
    label,
    count,
    amt, icon: Icon
}: {
    description: string,
    label: string,
    count: string,
    amt: string,
    color: string,
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
}) => {
    return (
        <Card x-chunk={description}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className="text-xl">
                        <Icon strokeWidth={1.75} />
                    </div> {label}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                    {amt}
                </p>
            </CardContent>
        </Card>
    )

}