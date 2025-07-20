"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import Image from "next/image";

interface Tag {
  id: string;
  name: string;
  parent?: Tag | null;
  children?: Tag[];
}

interface Category {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  key: string;
  value: string;
}

interface CombinationVariant {
  variant: Variant;
}

interface VariantCombination {
  id: string;
  price: number;
  stock: number;
  image?: string;
  variants: CombinationVariant[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image: string;
  stock: number;
  discount?: number;
  createdAt: string;
  category?: Category | null;
  productTags: { tag: Tag }[];
  variantCombinations: VariantCombination[];
}

export default function ProductList() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to fetch products");
        setProducts(data.products || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        [p.name, p.description, p.category?.name]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [products, searchTerm]
  );

  const getVariantSummary = (product: Product) => {
    const combinations = product.variantCombinations || [];

    if (!combinations.length) return "No variants";

    const allVariants = combinations.flatMap(
      (combo) => combo.variants?.map((v) => v.variant) || []
    );

    const uniqueValues = new Set(allVariants.map((v) => `${v.key}:${v.value}`));
    const summaryText = Array.from(uniqueValues)
      .map((entry) => {
        const [key, value] = entry.split(":");
        return `${value} (${key})`;
      })
      .join(", ");

    return `${combinations.length} variant${
      combinations.length > 1 ? "s" : ""
    } — ${summaryText}`;
  };
  
  if (loading)
    return (
      <div className="text-center py-12 text-gray-500">Loading products...</div>
    );
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Product Inventory</h1>
        <div className="relative w-full md:w-64">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => router.push("/dashboard/create-product")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Add New Product
        </button>
      </div>

      {/* Product Cards */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-500">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-lg overflow-hidden transition hover:shadow-lg"
            >
              <div className="w-full h-98 bg-gray-100 overflow-hidden">
                {product.image ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${product.image}`}
                    alt={product.name}
                    width={290}
                    height={240}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="truncate text-lg font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  Category: {product.category?.name || "Uncategorized"}
                </p>

                <p className="text-sm text-gray-700 mb-1">
                  Price: <span className="font-medium">Rs {product.price}</span>
                </p>

                <p className="text-sm text-gray-700 mb-1">
                  Discount:{" "}
                  <span className="font-medium">{product.discount}%</span>
                </p>

                <div className="text-sm text-gray-500 mb-1">
                  Stock:{" "}
                  <span
                    className={`font-medium ${
                      product.stock > 10
                        ? "text-green-600"
                        : product.stock > 0
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {product.stock}
                  </span>
                </div>

                {/* Variant Summary */}
                <p className="text-xs text-gray-400 italic mt-1">
                  {getVariantSummary(product)}
                </p>

                {/* Tags and Subtags */}
                {product.productTags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Tags:
                    </p>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {product.productTags
                        .filter((pt) => !pt.tag.parent) // Only top-level tags
                        .map((pt) => (
                          <span
                            key={pt.tag.id}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                          >
                            {pt.tag.name}
                          </span>
                        ))}
                    </div>

                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Subtags:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {product.productTags
                        .filter((pt) => pt.tag.parent) // Only subtags
                        .map((pt) => (
                          <span
                            key={pt.tag.id}
                            className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full"
                          >
                            {pt.tag.name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Manage Button */}
                <button
                  onClick={() =>
                    router.push(`/dashboard/edit-product/${product.id}`)
                  }
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-md"
                >
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
