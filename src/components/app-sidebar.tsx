"use client"

import * as React from "react"
import {
  IconPlus,
  IconEdit,
  IconInnerShadowTop,
  
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavManagement } from "@/components/navbar-management"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Mohammad",
    email: "mohammad@gmail.com",
    avatar: "/logo.png",
  },
  navMain: [
    {
      title: "Create Product",
      url: "/dashboard/create-product",
      icon: IconPlus,
    },
    {
      title: "Create Variant",
      url: "/dashboard/create-variant",
      icon: IconPlus,
    },
    {
      title: "Create Category",
      url: "/dashboard/create-category",
      icon: IconPlus,
    },
    {
      title: "Create Tag",
      url: "/dashboard/create-tag",
      icon: IconPlus,
    },
    {
      title: "Create Coupon",
      url: "/dashboard/create-coupon",
      icon: IconPlus,
    },
  ],

  management: [
    {
      name: "Banner Management",
      url: "/dashboard/manage-banner",
      icon: IconEdit,
    },
    {
      name: "Stock Management",
      url: "/dashboard/manage-stocks",
      icon: IconEdit,
    },
    {
      name: "Product Management",
      url: "/dashboard/view-products",
      icon: IconEdit,
    },
    {
      name:"Order Management",
      url:"/dashboard/manage-orders",
      icon:IconEdit
    },
    {
      name: "Import Data",
      url: "/dashboard/import-data",
      icon: IconEdit,
    }
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">OOGAN</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavManagement items={data.management}/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
