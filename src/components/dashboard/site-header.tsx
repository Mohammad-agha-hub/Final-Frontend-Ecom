"use client"
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { useRouter } from "next/navigation";

export function SiteHeader() {
  const router = useRouter()
  return (
    <header className="flex h-(--header-height) shrink-0 items-center border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center px-4 lg:px-6">
        {/* Left section - Sidebar trigger and username */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 cursor-pointer" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          
        </div>

        {/* Center section - Navigation links */}
        <div className="mx-auto flex items-center gap-4">
          <Button variant="ghost" className="text-sm cursor-pointer" onClick={()=>router.push('/')}>
            Home
          </Button>
          <Button variant="ghost" className="text-sm cursor-pointer" onClick={()=>router.push('/checkout')}>
            Checkout
          </Button>
          <Button variant="ghost" className="text-sm cursor-pointer" onClick={()=>router.push('/wishlist')}>
            Wishlist
          </Button>
        </div>

        {/* Right section - Account (will be modified later) */}
        <div className="ml-auto">
          
            
          
        </div>
      </div>
    </header>
  );
}
