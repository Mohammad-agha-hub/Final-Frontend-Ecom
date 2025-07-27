// app/dashboard/page.tsx

import { SectionCards } from "@/components/section-cards";
import DataTable from "@/components/data-table";
import { getServerSession } from "next-auth";
import { authOptions } from "../../..//auth.config";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

    if (!session || session.user.isAdmin !== true) {
    return redirect("/");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/all`,
    {
      headers: {
        Authorization: `Bearer ${session.user.backendToken}`,
      },
      cache: "no-store", // ensure fresh data on each request
    }
  );
  const customerFetch = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/getUsers`,
    {
      headers: {
        Authorization: `Bearer ${session.user.backendToken}`,
      },
      cache: "no-store", // ensure fresh data on each request
    }
  );
  const dashboardRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dashboard`,
    {
      headers: {
        Authorization: `Bearer ${session.user.backendToken}`,
      },
      cache: "no-store",
    }
  );
  
  if (!dashboardRes.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }
  if(!customerFetch.ok){
    throw new Error("Failed to fetch customer data")
  }
  const result = await res.json();
  const data = result.orders

  const customerData = await customerFetch.json()
  const dashboardJson = await dashboardRes.json();
  const dashboardData = dashboardJson.data;
  
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards metrics={dashboardData}/>
          <DataTable orders={data} users={customerData.users} />
        </div>
      </div>
    </div>
  );
}
