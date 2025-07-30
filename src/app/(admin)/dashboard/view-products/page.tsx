// app/(admin)/dashboard/products/page.tsx — Server Component
import ProductView from "./ProductView";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";

import { Metadata } from "next";

export const metadata:Metadata={
  title:"View Product"
}

export default async function ProductListPage() {
  const session = await getServerSession(authOptions);  
  if (!session || session.user.isAdmin !== true) {
      return redirect("/");
    }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
    {
      cache: "no-store" // optional caching
    }
  );

  if (!res.ok) {
    // Handle error rendering here if desired
    throw new Error("Failed to fetch products");
  }

  const data = await res.json();

  return <ProductView initialProducts={data.products || []} />;
}
