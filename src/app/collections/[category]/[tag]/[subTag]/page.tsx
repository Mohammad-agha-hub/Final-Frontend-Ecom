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

interface ProductTag {
  id: string;
  tag: TagType;
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
      // revalidate every 5 minutes
      next: { revalidate: 100 },
    }
  );
  const data = await res.json();
  
  const filteredProducts = (data.products as Product[]).filter((product) => {
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
  });
  

  return (
    <div className="h-screen">
      <CategoryMenu />
      <CollectionFilter items={filteredProducts} />
    </div>
  );
}
