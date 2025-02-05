'use client'

import { useRouter } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { IconType } from "react-icons/lib"

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

export function NavMain({ items, groupLabel }: { groupLabel: string, items: MenuItem[] }) {
  const router = useRouter()

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const href = e.currentTarget.getAttribute('href')
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
                  className="w-full text-slate-100 justify-between hover:text-white hover:bg-slate-700/50 transition-colors duration-200 rounded-md px-4 py-2 flex items-center group"
                >
                  <div className="flex items-center gap-3">
                    {subItem.icon && (
                      <subItem.icon
                        size={18}
                        className="transition-colors duration-150 text-white group-hover:text-white"
                      />
                    )}
                    <span className="truncate text-sm font-medium">{subItem.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform duration-200 text-slate-400 group-hover:text-white group-data-[state=open]:rotate-90" />
                </SidebarMenuSubButton>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1 pb-2">
                {renderSubItems(subItem.items)}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenuSubButton
              asChild
              className="w-full text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200 rounded-md px-4 py-2"
            >
              <a href={subItem.url} onClick={handleNavigation} className="flex items-center gap-3">
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
                <span className="truncate text-sm">{subItem.title}</span>
              </a>
            </SidebarMenuSubButton>
          )}
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  )

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-4 py-1 font-semibold text-gray-300 bg-slate-600 text-sm rounded-t-lg mb-2">
        {groupLabel}
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {items.map((item) => (
          <SidebarMenuItem key={item.title} className="pl-2">
            {item.items ? (
              <Collapsible
                defaultOpen={item.isActive}
                className="group w-full"
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="w-full hover:bg-slate-700/50 hover:text-white justify-between transition-colors duration-200 rounded-md group px-4 py-2"
                  >
                    <div className="flex gap-2 items-center">
                      {item.icon && <item.icon size={16} className="transition-colors duration-150" />}
                      <span className="font-medium truncate">{item.title}</span>
                    </div>
                    <ChevronRight className="ml-2 h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1 pb-2">
                  {renderSubItems(item.items)}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className="w-full hover:bg-slate-700/50 hover:text-white transition-colors duration-200 rounded-md px-4 py-2"
              >
                <a href={item.url} onClick={handleNavigation} className="flex items-center">
                  {item.icon && <item.icon className="text-slate-300 group-hover:text-white transition-colors duration-200" />}
                  <span className="font-medium truncate">{item.title}</span>
                </a>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}