// app/product/[slug]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import ProductClient from "./ProductClient";
import { Product } from "@/components/utilities/types";
import { Metadata } from "next";

type Props = {
  params:Promise<{slug:string}>
}
export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
      {
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();

    return data.products.map((product: { slug: string }) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

export async function generateMetadata({params}:Props): Promise<Metadata> {
  const {slug} = await params
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/product/${slug}`,
    { next: { revalidate: 60 } }
  );
  const data = await res.json();
  const product = data.product;
  return {
    title: product.name,
    description:product.description,
    openGraph:{
      images:[
        {
          url:product.images.url||""
        }
      ]
    }
  };
}



async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/product/${slug}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) throw new Error("Failed to fetch product");

    const data = await res.json();
    return data?.product ?? null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

async function fetchWishlist(token: string | undefined) {
  if (!token) return [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlist`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!res.ok) throw new Error("Failed to fetch wishlist");

    const data = await res.json();
    return data?.wishlist || [];
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const {slug} = await params
  const session = await getServerSession(authOptions);
  const product = await fetchProduct(slug);
  const wishlist = await fetchWishlist(session?.user.backendToken);

  if (!product)
    return (
      <div className="h-screen flex justify-center items-center text-4xl font-bold">
        Product not found
      </div>
    );

  const isWished = wishlist.some(
    (item: { productId: string }) => item.productId === product.id
  );

  return <ProductClient product={product} wished={isWished} />;
}
