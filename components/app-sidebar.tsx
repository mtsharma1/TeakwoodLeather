"use client"

import * as React from "react"
import {
  GalleryVerticalEnd,
  SquareTerminal,
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
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Analysis",
      url: "/analysis",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Over Stock",
          url: "/analysis/overstock",
        },
        {
          title: "Under Stock",
          url: "/analysis/understock",
        },
        {
          title: "Under Price 2",
          url: "/analysis/underprice2",
        },
        {
          title: "Sales Grade & Inventory MIS",
          url: "/analysis/salesinventorsSummary",
        },
        {
          title: "Common Order",
          url: "/analysis/commonordersummary",
        },
        {
          title: "Order Summary",
          url: "/analysis/ordersummary",
        },
      ],
    },
    {
      title: "Category",
      url: "/category",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Mens Shoes",
          url: "/category/mens-shoes",
        },
        {
          title: "Womens Shoes",
          url: "/category/women-shoes",
        },
        {
          title: "Kids Shoes",
          url: "/category/kids-shoes",
        },
        {
          title: "Leather Jackets",
          url: "/category/leather-jackets",
        },
        {
          title: "Leather Men Casual Belt",
          url: "/category/leather-men-casual-belt",
        },
      ],
    }
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="bg-slate-800">
      <SidebarHeader className="bg-slate-800 text-white">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="bg-slate-800 text-white">
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
