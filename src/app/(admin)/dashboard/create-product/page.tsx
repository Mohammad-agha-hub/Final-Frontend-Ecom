// app/dashboard/create-product/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth.config";
import CreateProductForm from "./CreateProductForm";
import { redirect } from "next/navigation";

export interface Tag {
  id: string;
  name: string;
  parentId?: string | null;
  children?: Tag[];
}

interface ServerVariantValue {
  id: string;
  key: string; // like "Color"
  value: string;
  createdAt: string;
}

interface Variant {
  key: string;
  value: string;
}

export default async function CreateProductPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.isAdmin !== true) {
    return redirect("/");
  }
  const headers = {
    Authorization: `Bearer ${session?.user?.backendToken}`,
  };

  const [catRes, tagRes, variantRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`, {
      headers,
      cache: "no-store",
    }),
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags/flat`, {
      headers,
      cache: "no-store",
    }),
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variants`, {
      headers,
      cache: "no-store",
    }),
  ]);

  if (!catRes.ok || !tagRes.ok || !variantRes.ok) {
    throw new Error("Failed to fetch required data.");
  }

  const catData = await catRes.json();
  const tagData = await tagRes.json();
  const variantData = await variantRes.json(); // contains `variants: { Color: [...], Size: [...] }`

  const dedupedTags = Array.from(
    new Map((tagData.tags as Tag[]).map((t) => [t.name, t])).values()
  );

  // Flatten the nested variant object into a Variant[]
  const mapped: Variant[] = Object.entries(variantData.variants).flatMap(
    ([key, values]) =>
      (values as ServerVariantValue[]).map((v) => ({
        key,
        value: v.value,
      }))
  );

  return (
    <CreateProductForm
      categories={catData.categories || []}
      tags={dedupedTags}
      variants={mapped}
    />
  );
}
