import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";
import CategoryManagement from "./CategoryManagement";

import { Metadata } from "next";

export const metadata:Metadata={
  title:"Create Category"
}

export default async function CategoryPage() {
  const session = await getServerSession(authOptions);
  

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`,
    {
      headers: {
        Authorization: `Bearer ${session?.user.backendToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await res.json();
  const categories = data?.success ? data.categories : [];
 
  if (!session || session.user.isAdmin !== true) {
    redirect("/");
  }
  return <CategoryManagement initialCategories={categories} />;
}
