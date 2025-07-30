// app/(admin)/dashboard/orders/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import OrderManagement from "./OrderManagement";
import { redirect } from "next/navigation";

import { Metadata } from "next";

export const metadata:Metadata={
  title:"Manage Orders"
}

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.isAdmin !== true) {
    return redirect("/");
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/all?page=1&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${session?.user.backendToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await res.json();

  return (
    <OrderManagement
      initialOrders={data.orders || []}
      totalPages={data.totalPages || 1}
      token={session?.user.backendToken || ""}
    />
  );
}
