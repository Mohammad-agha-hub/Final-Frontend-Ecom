// app/dashboard/layout.tsx
import Loading from "@/app/loading";
import { RouteTransitionProvider } from "@/components/admin/RouteTransitionProvider";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    default: "OGAAN Online Design Store",
    template: "%s - Online Design Store",
  },
  description: "OGAAN Online Design Store",
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
