"use client"

import * as React from "react"
import {
  AudioWaveform,
  Command,
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
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
