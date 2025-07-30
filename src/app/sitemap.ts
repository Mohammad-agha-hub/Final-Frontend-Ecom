import { MetadataRoute } from "next";
import { Product } from "@/components/utilities/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`);
  const data = await res.json();
  const products: Product[] = data.products;

  const combinations = new Set<string>();
  for (const product of products) {
    const categorySlug = product.category?.name;
    if (!categorySlug) {
      continue;
    }
  
    for (const tagItem of product.productTags || []) {
      const tag = tagItem.tag;
      if (!tag) {
        continue;
      }
  
      if (!tag.parent) {
        continue;
      }
  
      const parentSlug = tag.parent.slug;
      const childSlug = tag.slug;
  
      if (categorySlug && parentSlug && childSlug) {
        const comboKey = `${categorySlug}/${parentSlug}/${childSlug}`;
        combinations.add(comboKey);
        
      } else {
        console.log("Missing slugs");
      }
    }
  }
  

  const urls: MetadataRoute.Sitemap = Array.from(combinations).map(path => ({
    url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/collections/${path}`,
    lastModified: new Date(),
  }));
  console.log(urls.map((u)=>u.url))
  const productEntries: MetadataRoute.Sitemap = products.map((product: Product) => ({
    url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/products/${product.slug}`,
    lastModified: new Date(),
  }));

  return [
    ...[
      "checkout",
      "orders",
      "login",
      "order-confirmation",
      "profile",
      "wishlist",
      "dashboard",
      "dashboard/create-category",
      "dashboard/create-coupon",
      "dashboard/create-product",
      "dashboard/create-tag",
      "dashboard/create-variant",
      "dashboard/edit-product",
      "dashboard/edit-variants",
      "dashboard/import-data",
      "dashboard/manage-banner",
      "dashboard/manage-orders",
      "dashboard/manage-shipping",
      "dashboard/manage-stocks",
      "dashboard/view-products",
    ].map(path => ({
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/${path}`,
      lastModified: new Date(),
    })),
    ...urls,
    ...productEntries,
  ];
}
