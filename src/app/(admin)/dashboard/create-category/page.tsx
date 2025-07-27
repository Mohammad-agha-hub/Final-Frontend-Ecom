import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";
import CategoryManagement from "./CategoryManagement";

export default async function CategoryPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.isAdmin !== true) {
    return redirect("/");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`,
    {
      headers: {
        Authorization: `Bearer ${session.user.backendToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await res.json();
  const categories = data?.success ? data.categories : [];

  return <CategoryManagement initialCategories={categories} />;
}
