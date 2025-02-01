"use client"

import * as React from "react"
import {
  Package,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Teackwood",
    email: "Teackwood.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Teackwood",
      logo: Package,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Package,
    },
    {
      title: "Inventory",
      url: "/monthly-report",
      icon: Package,
      isActive: false,
      items: [
        {
          title: "Analysis",
          url: "/monthly-report/analysis",
          isActive: true,
          items: [
            {
              title: "Over Stock",
              url: "/monthly-report/analysis/overstock",
            },
            {
              title: "Under Stock",
              url: "/monthly-report/analysis/understock",
            },
            {
              title: "Under Price 2",
              url: "/monthly-report/analysis/under-price-2",
            },
            {
              title: "Sales Grade & Inventory MIS",
              url: "/monthly-report/analysis/sales-inventors-Summary",
            },
            {
              title: "Common Order",
              url: "/monthly-report/analysis/common-order-summary",
            },
            {
              title: "Order Summary",
              url: "/monthly-report/analysis/order-summary",
            },
          ],
        },
        {
          title: "Category",
          url: "/monthly-report/category",
          isActive: false,
          items: [
            {
              title: "Mens Shoes",
              url: "/monthly-report/category/mens-shoes",
            },
            {
              title: "Womens Shoes",
              url: "/monthly-report/category/women-shoes",
            },
            {
              title: "Kids Shoes",
              url: "/monthly-report/category/kids-shoes",
            },
            {
              title: "Leather Jackets",
              url: "/monthly-report/category/leather-jackets",
            },
            {
              title: "Leather Men Casual Belt",
              url: "/monthly-report/category/leather-men-casual-belt",
            },
            {
              title: "Other Category",
              url: "/monthly-report/category/other-category",
            },
          ],
        },
      ],
    },
    {
      title: "Price Checklist",
      url: "/price-checklist/overview",
      icon: Package,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="bg-slate-800 ">
      <SidebarHeader className="bg-slate-800 text-white">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="bg-slate-800 scrollbar-none text-white">
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter className="bg-slate-800 text-white">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
