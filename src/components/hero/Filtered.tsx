// components/hero/Filtered.tsx
import ClientSlider from "./FilteredClient";
import { Products } from "../utilities/types";

async function fetchProducts(): Promise<Products[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?page=1&limit=20`,
    {
      cache: "no-store",
    }
  );
  const data = await res.json();

  
  return Array.isArray(data) ? data : data.products || [];
}

export default async function Filtered() {
  const products = await fetchProducts();
  const filteredProducts = products.filter(product=>product.category.name === "Women")
  return <ClientSlider initialProducts={filteredProducts} />;
}
