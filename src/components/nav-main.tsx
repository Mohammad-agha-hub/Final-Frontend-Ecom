"use client"

import {IconDashboard, type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  return (
    <SidebarGroup>
      
      <SidebarGroupContent className="flex flex-col">
       <Link href={'/dashboard'}>
       <SidebarMenuItem className="list-none pb-2 text-base">
        <SidebarMenuButton tooltip='Dashboard'>
                {<IconDashboard/>}
                <span>Dashboard</span>
              </SidebarMenuButton>
        </SidebarMenuItem>
       </Link>
        <SidebarGroupLabel>Create</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <Link href={item.url} key={item.title}>
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
