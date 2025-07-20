// components/hero/Filtered.tsx
import ClientSlider from "./FilteredClient";

interface Product {
  id: string;
  name: string;
  slug: string;
  image: string[];
}

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
    {
      next: { revalidate: 3600 },
    }
  );
  const data = await res.json();
  console.log(data)
  return Array.isArray(data) ? data : data.products || [];
}

export default async function Filtered() {
  const products = await fetchProducts();

  return <ClientSlider initialProducts={products} />;
}
