"use client"

import { useRouter } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar"
import type { IconType } from "react-icons/lib"
import { cn } from "@/lib/utils"
import type React from "react" // Added import for React

interface SubItem {
  title: string
  url: string
  isActive?: boolean
  items?: SubItem[]
  icon?: LucideIcon | IconType
  subIcon?: LucideIcon | IconType
}

interface MenuItem {
  title: string
  url: string
  icon?: LucideIcon | IconType
  isActive?: boolean
  items?: SubItem[]
}

export function NavMain({ items, groupLabel }: { groupLabel: string; items: MenuItem[] }) {
  const router = useRouter()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const href = e.currentTarget.getAttribute("href")
    if (href) {
      router.push(href)
    }
  }

  const renderSubItems = (subItems: SubItem[]) => (
    <SidebarMenuSub>
      {subItems.map((subItem) => (
        <SidebarMenuSubItem key={subItem.title}>
          {subItem.items ? (
            <Collapsible defaultOpen={subItem?.isActive} className="w-full">
              <CollapsibleTrigger asChild>
                <SidebarMenuSubButton
                  className={cn(
                    "w-full text-slate-100 justify-between hover:text-white hover:bg-slate-700/50 transition-colors duration-200 rounded-md flex items-center group",
                    isCollapsed ? "px-2 py-2" : "px-4 py-2",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {subItem.icon && (
                      <subItem.icon
                        size={18}
                        className="transition-colors duration-150 text-white group-hover:text-white"
                      />
                    )}
                    {!isCollapsed && <span className="truncate text-sm font-medium">{subItem.title}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform duration-200 text-slate-400 group-hover:text-white group-data-[state=open]:rotate-90" />
                  )}
                </SidebarMenuSubButton>
              </CollapsibleTrigger>
              <CollapsibleContent className={cn("pt-1 pb-2", isCollapsed && "hidden")}>
                {renderSubItems(subItem.items)}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenuSubButton
              asChild
              className={cn(
                "w-full text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200 rounded-md",
                isCollapsed ? "px-2 py-2" : "px-4 py-2",
              )}
            >
              <a href={subItem.url} onClick={handleNavigation} className="grid grid-cols-7">
                <div className="flex items-center relative w-[18px] h-[18px]">
                  {subItem.icon && (
                    <subItem.icon
                      size={18}
                      className="transition-colors duration-150 text-white group-hover:text-white absolute"
                    />
                  )}
                  {subItem.subIcon && (
                    <subItem.subIcon
                      size={10}
                      className="transition-colors duration-150 text-white group-hover:text-white absolute left-[0.96rem] bottom-0"
                    />
                  )}
                </div>
                {!isCollapsed && <span className="truncate text-sm col-span-6">{subItem.title}</span>}
              </a>
            </SidebarMenuSubButton>
          )}
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  )

  return (
    <SidebarGroup>
      {!isCollapsed && (
        <SidebarGroupLabel className="px-4 py-1 font-semibold text-gray-300 bg-slate-600 text-sm rounded-t-lg mb-2">
          {groupLabel}
        </SidebarGroupLabel>
      )}
      <SidebarMenu className="space-y-1">
        {items.map((item) => (
          <SidebarMenuItem key={item.title} className={cn(isCollapsed ? "px-0" : "pl-2")}>
            {item.items ? (
              <Collapsible defaultOpen={item.isActive} className="group w-full">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      "w-full hover:bg-slate-700/50 hover:text-white justify-between transition-colors duration-200 rounded-md group",
                      isCollapsed ? "px-2 py-2" : "px-4 py-2",
                    )}
                  >
                    <div className="flex gap-4 items-center">
                      {item.icon && <item.icon size={16} className="transition-colors duration-150" />}
                      {!isCollapsed && <span className="font-medium truncate">{item.title}</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronRight className="ml-2 h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className={cn("pt-1 pb-2", isCollapsed && "hidden")}>
                  {renderSubItems(item.items)}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={cn(
                  "w-full hover:bg-slate-700/50 hover:text-white transition-colors duration-200 rounded-md",
                  isCollapsed ? "px-2 py-2" : "px-4 py-2",
                )}
              >
                <a href={item.url} onClick={handleNavigation} className="flex items-center">
                  {item.icon && (
                    <item.icon className="text-slate-300 group-hover:text-white transition-colors duration-200" />
                  )}
                  {!isCollapsed && <span className="font-medium truncate ml-2">{item.title}</span>}
                </a>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}