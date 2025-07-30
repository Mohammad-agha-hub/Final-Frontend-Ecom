// app/(user)/order-history/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";
import ClientOrder from "./ClientOrder";
import { Metadata } from "next";

export const metadata:Metadata={
  title:"Order History"
}

export default async function OrderHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect("/login");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/my-orders`,
    {
      headers: {
        Authorization: `Bearer ${session.user.backendToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await res.json();

  return <ClientOrder orders={Array.isArray(data.orders) ? data.orders : []} />;
}
