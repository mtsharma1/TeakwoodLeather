'use client'

import * as React from "react"
import { ArrowDownWideNarrow, ArrowUpNarrowWide, BookText, Boxes, BringToFront, Calendar, CalendarMinus, ChartNoAxesCombined, CircleDollarSign, Footprints, GalleryHorizontal, LayoutGrid, MoveDown, Package, SquareActivity, SquareKanban } from "lucide-react"
import { NavMain } from "@/components/nav-main"
// import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { CgMoreVerticalAlt } from "react-icons/cg";
import { GiBeltBuckles, GiSleevelessJacket } from "react-icons/gi";
import { BiCategoryAlt } from "react-icons/bi";
import { MdOutlineInventory2, MdPriceCheck } from "react-icons/md";
import { TbCategory } from "react-icons/tb";
import { RiDashboardLine } from "react-icons/ri";



// This is sample data.
const data = {
  groupLabel: "Monthly Order Report",
  teams: [
    {
      name: "Teakwood",
      logo: Package,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: RiDashboardLine,
    },
    {
      title: "Inventory",
      url: "/monthly-report",
      icon: MdOutlineInventory2,
      isActive: false,
      items: [
        {
          title: "Overview",
          url: "/monthly-report/raw-data",
          icon: RiDashboardLine,
        },
        {
          title: "Analysis",
          url: "/monthly-report/analysis",
          isActive: true,
          icon: ChartNoAxesCombined,
          items: [
            {
              title: "Over Stock",
              url: "/monthly-report/analysis/over-stock",
              icon: ArrowUpNarrowWide,
            },
            {
              title: "Under Stock",
              url: "/monthly-report/analysis/under-stock",
              icon: ArrowDownWideNarrow,
            },
            {
              title: "Under Price 2",
              url: "/monthly-report/analysis/under-price-2",
              icon: CircleDollarSign,
              subIcon: MoveDown
            },
            {
              title: "Sales Grade",
              url: "/monthly-report/analysis/sales-Summary",
              icon: LayoutGrid,
            },
            {
              title: "Inventory MIS",
              url: "/monthly-report/analysis/inventory-mis",
              icon: LayoutGrid,
            },
            {
              title: "Common Order",
              url: "/monthly-report/analysis/common-order-summary",
              icon: BringToFront,
            },
            {
              title: "Order Summary",
              url: "/monthly-report/analysis/order-summary",
              icon: BookText,
            },
            {
              title: "New Grade",
              url: "/monthly-report/analysis/new-grade",
              icon: LayoutGrid,
            },
          ],
        },
        {
          title: "Category",
          url: "/monthly-report/category",
          isActive: false,
          icon: BiCategoryAlt,
          items: [
            {
              title: "Mens Shoes",
              url: "/monthly-report/category/mens-shoes",
              icon: Footprints,
            },
            {
              title: "Womens Shoes",
              url: "/monthly-report/category/women-shoes",
              icon: Footprints,
            },
            {
              title: "Kids Shoes",
              url: "/monthly-report/category/kids-shoes",
              icon: Footprints,
            },
            {
              title: "Leather Jackets",
              url: "/monthly-report/category/leather-jackets",
              icon: GiSleevelessJacket,
            },
            {
              title: "Leather Men Casual Belt",
              url: "/monthly-report/category/leather-men-casual-belt",
              icon: GiBeltBuckles,
            },
            {
              title: "Other Category",
              url: "/monthly-report/category/other-category",
              icon: CgMoreVerticalAlt,
            },
          ],
        },
      ],
    },
  ],
}

const data2 = {
  groupLabel: "Price Checklist",
  navMain: [
    {
      title: "Price Checklist",
      url: "/price-checklist/overview",
      icon: MdPriceCheck,
    },
  ],
}

const data3 = {
  groupLabel: "Daily Sales Report",
  navMain: [
    {
      title: "Category and Portal",
      url: "/category-poral",
      icon: TbCategory,
      isActive: false,
      items: [
        {
          title: "Raw Data",
          url: "/category-poral/raw-data",
          icon: SquareKanban,
        },
        {
          title: "Yesterday",
          url: "/category-poral/yesterday",
          icon: CalendarMinus,
        },
        {
          title: "Today",
          url: "/category-poral/today",
          icon: Calendar,
        },
        {
          title: "Portal",
          url: "/category-poral/report/poral",
          icon: GalleryHorizontal,
        },
        {
          title: "Category",
          url: "/category-poral/report/category",
          icon: Boxes,
        },
        {
          title: "Export Tally GST Report",
          url: "/category-poral/monthly-report",
          icon: SquareActivity,
        },
      ]
    }
  ],
}

const data4 = {
  groupLabel: "Channel Item Report",
  navMain: [
    {
      title: "Channel Report",
      url: "/channel-report",
      icon: TbCategory,
      isActive: false,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="bg-slate-800">
      <SidebarHeader className="bg-slate-800 text-white">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="bg-slate-800 scrollbar-none text-white">
        <NavMain items={data.navMain} groupLabel={data.groupLabel} />
        <NavMain items={data2.navMain} groupLabel={data2.groupLabel} />
        <NavMain items={data3.navMain} groupLabel={data3.groupLabel} />
        <NavMain items={data4.navMain} groupLabel={data4.groupLabel} />
      </SidebarContent>
      <SidebarFooter className="bg-slate-800 text-white">
        {/* <NavUser /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}