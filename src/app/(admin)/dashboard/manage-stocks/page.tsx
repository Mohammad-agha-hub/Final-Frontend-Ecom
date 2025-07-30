import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import StockManagement from "./StockManagement";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata:Metadata={
  title:"Manage Stocks"
}
export default async function StockPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.isAdmin !== true) {
    return redirect("/");
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variantcombination`,
    {
      headers: {
        Authorization: `Bearer ${session?.user.backendToken}`,
      },
      cache: "no-store", // don't cache in server
    }
  );

  const data = await res.json();

  return (
    <StockManagement
      combinations={data.combinations || []}
      backendToken={session?.user.backendToken || ""}
    />
  );
}
