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

interface SubItem {
  title: string
  url: string
  items?: SubItem[]
}

interface MenuItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: SubItem[]
}

export function NavMain({ items }: { items: MenuItem[] }) {
  const renderSubItems = (subItems: SubItem[]) => (
    <SidebarMenuSub>
      {subItems.map((subItem) => (
        <SidebarMenuSubItem key={subItem.title}>
          {subItem.items ? (
            <Collapsible defaultOpen className="w-full">
              <CollapsibleTrigger asChild>
                <SidebarMenuSubButton 
                  className="w-full text-slate-100 justify-between hover:text-white hover:bg-slate-700/50 transition-colors duration-200 rounded-md pl-8 pr-4 py-2 flex items-center group"
                >
                  <span className="truncate">{subItem.title}</span>
                  <ChevronRight className="ml-2 h-4 w-4 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </SidebarMenuSubButton>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1 pb-2">
                {renderSubItems(subItem.items)}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenuSubButton 
              asChild 
              className="w-full text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200 rounded-md pl-12 pr-4 py-2"
            >
              <a href={subItem.url}>
                <span className="truncate">{subItem.title}</span>
              </a>
            </SidebarMenuSubButton>
          )}
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  )

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-4 py-2 font-semibold text-white bg-slate-700 rounded-t-lg mb-2">
        Inventory Management System
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
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
                    <div className="flex gap-2 items-center">{item.icon && <item.icon size={16} className="transition-colors duration-150" />}
                    <span className="font-medium truncate">{item.title}</span></div>
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
                <a href={item.url} className="flex items-center">
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