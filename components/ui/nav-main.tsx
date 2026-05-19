"use client"

import { type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
}) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarGroup>
      <SidebarGroupLabel>MENU</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Check if item is active based on pathname or explicit isActive prop
          let isActive = false
          if (item.isActive) {
            isActive = true
          } else if (pathname && item.url !== "#") {
            // Exact match or pathname starts with the item url
            isActive = pathname === item.url || pathname.startsWith(item.url + "/")
          } else if (pathname === "/dashboard" && item.url === "/dashboard") {
            isActive = true
          }
          
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title} 
                isActive={isActive} 
                size={isActive && !isCollapsed ? "lg" : "default"}
              >
                <Link 
                  href={item.url} 
                  className={`flex items-center min-w-0 w-full overflow-hidden ${isCollapsed ? 'justify-center gap-0' : 'gap-2'}`}
                >
                  <item.icon className={isActive && !isCollapsed ? "h-10 shrink-0" : "size-4 shrink-0"} />
                  {!isCollapsed ? <span className="truncate min-w-0 flex-1">{item.title}</span> : null}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
