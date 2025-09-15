import React from "react";
import CollectionFilter from "@/components/collectionComp/CollectionFilter";
import CategoryMenu from "@/components/hero/CategoryMenu";
import { Product } from "@/components/utilities/types";

interface Params {
  category: string;
  tag: string;
  subTag: string;
}
interface TagType {
  id: string;
  name: string;
  slug: string;
  parent?: {
    name: string;
  };
}
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections",
};

type ColorVariant = {
  value: string; // e.g., "#0787a6"
};

interface ProductTag {
  id: string;
  tag: TagType;
}

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
      { cache: "no-store", next: { revalidate: 60 } }
    );
    const data = await res.json();

    const paramsSet = new Set<string>();
    const paramsArray: Params[] = [];

    for (const product of data.products) {
      const category = product.category?.name?.toLowerCase();

      // Handle regular categories
      for (const pt of product.productTags || []) {
        const tag = pt.tag?.parent?.name?.toLowerCase();
        const subTag = pt.tag?.slug?.toLowerCase();
        if (category && tag && subTag) {
          const key = `${category}-${tag}-${subTag}`;
          if (!paramsSet.has(key)) {
            paramsSet.add(key);
            paramsArray.push({ category, tag, subTag });
          }
        }
      }

      // Handle "Just In" special case - category becomes tag
      if (category && category !== "just in") {
        for (const pt of product.productTags || []) {
          const subTag = pt.tag?.slug?.toLowerCase();
          if (subTag) {
            const key = `just in-${category}-${subTag}`;
            if (!paramsSet.has(key)) {
              paramsSet.add(key);
              paramsArray.push({
                category: "just in",
                tag: category,
                subTag: subTag,
              });
            }
          }
        }
      }
    }

    return paramsArray;
  } catch (error) {
    console.error("Failed to generate static params:", error);
    return [];
  }
}

export default async function Collection({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category, tag, subTag } = await params;

  // Fetch products
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
    {
      next: { revalidate: 100 },
    }
  );
  const data = await res.json();

  const filteredProducts = (data.products as Product[]).filter((product) => {
    // Special handling for "Just In"
    if (category?.toLowerCase() === "just in") {
      // For "Just In", the tag parameter is actually the category name
      const matchesCategory =
        product.category?.name?.toLowerCase() === tag?.toLowerCase();

      const matchesSubTag = product.productTags?.some(
        (t: ProductTag) =>
          t.tag?.slug &&
          subTag &&
          t.tag.slug.toLowerCase() === subTag.toLowerCase()
      );

      return matchesCategory && matchesSubTag;
    } else {
      // Regular category filtering
      const matchesCategory =
        product.category?.name?.toLowerCase() === category?.toLowerCase();

      const matchesParentTag = product.productTags?.some(
        (t: ProductTag) =>
          t.tag?.parent?.name &&
          tag &&
          t.tag.parent.name.toLowerCase() === tag.toLowerCase()
      );

      const matchesSubTag = product.productTags?.some(
        (t: ProductTag) =>
          t.tag?.slug &&
          subTag &&
          t.tag.slug.toLowerCase() === subTag.toLowerCase()
      );

      return matchesCategory && matchesParentTag && matchesSubTag;
    }
  });

  const colorSet = new Set<string>();
  for (const product of filteredProducts) {
    for (const combination of product.variantCombinations || []) {
      for (const variantWrapper of combination.variants || []) {
        const variant = variantWrapper.variant;
        if (variant?.key?.toLowerCase() === "color") {
          colorSet.add(variant.value);
        }
      }
    }
  }
  const uniqueColors: ColorVariant[] = Array.from(colorSet).map((value) => ({
    value,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <CategoryMenu />
      <div className="flex-1 overflow-y-auto">
        <CollectionFilter colors={uniqueColors} items={filteredProducts} />
      </div>
    </div>
  );
}
