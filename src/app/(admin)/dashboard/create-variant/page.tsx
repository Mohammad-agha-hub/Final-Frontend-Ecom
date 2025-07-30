// app/(admin)/dashboard/variants/page.tsx or similar

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config"; // adjust path as needed
import VariantManagement from "./VariantManagement"; // client component
import type { Variant } from "./VariantManagement";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic"; // optional, if you want SSR for each request

import { Metadata } from "next";

export const metadata:Metadata={
  title:"Create Variant"
}

export default async function VariantManagementPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.isAdmin !== true) {
    return redirect("/");
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variants`, {
    headers: {
      Authorization: `Bearer ${session?.user?.backendToken}`,
    },
    cache: "no-store",
  });

  const data = await res.json();
  const variants = Object.values(data.variants || {}).flat() as Variant[];

  return <VariantManagement serverVariants={variants} token={session?.user?.backendToken} />;
}
