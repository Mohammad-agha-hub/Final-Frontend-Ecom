// app/dashboard/layout.tsx
import Loading from "@/app/loading";
import { RouteTransitionProvider } from "@/components/admin/RouteTransitionProvider";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "E-Commerce",
  description: "Ecommerce-Website",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <RouteTransitionProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </SidebarInset>
      </RouteTransitionProvider>
    </SidebarProvider>
  );
}
