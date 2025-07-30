// app/(admin)/dashboard/tag-management/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import TagManagement from "./TagManagement";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import { Metadata } from "next";

export const metadata:Metadata={
  title:"Create Tag"
}

export default async function TagManagementPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.backendToken) return null;
  if (!session || session.user.isAdmin !== true) {
    return redirect("/");
  }

  const headers = {
    Authorization: `Bearer ${session.user.backendToken}`,
  };

  const [tagsRes, categoriesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags`, { headers }),
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`, { headers }),
  ]);

  const [tagsData, categoriesData] = await Promise.all([
    tagsRes.json(),
    categoriesRes.json(),
  ]);

  if (!tagsData.success || !categoriesData.success) {
    throw new Error("Failed to load data");
  }

  return (
    <TagManagement
      tags={tagsData.tags}
      categories={categoriesData.categories}
      backendToken={session.user.backendToken}
    />
  );
}
