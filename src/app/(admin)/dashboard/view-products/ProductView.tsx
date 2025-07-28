"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
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
interface ProductImage {
  id: number;
  url: string;
  alt?: string;
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
  images:ProductImage[];
  discount?: number;
  createdAt: string;
  category?: Category | null;
  productTags: { tag: Tag }[];
  variantCombinations: VariantCombination[];
}

interface ProductListClientProps {
  initialProducts: Product[];
}

export default function ProductView({ initialProducts }: ProductListClientProps) {
  
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const products = initialProducts;
  const {data:session} = useSession()
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
  if(!session || session.user.isAdmin !== true){
    return (
      <div className="text-center text-destructive mt-10 text-lg font-semibold">
        Access denied.
      </div>
    );}
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Product Inventory</h1>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => router.push("/dashboard/create-product")}
            className="whitespace-nowrap"
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Product Cards */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-500">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="w-full h-100 bg-gray-100 overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={290}
                    height={240}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <CardContent className="p-4 space-y-2">
                <h3 className="truncate text-lg font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Category: {product.category?.name || "Uncategorized"}
                </p>
                <p className="text-sm text-gray-700">
                  Price: <span className="font-medium">Rs {product.price}</span>
                </p>
                <p className="text-sm text-gray-700">
                  Discount:{" "}
                  <span className="font-medium">{product.discount || 0}%</span>
                </p>
                <p className="text-sm">
                  Stock:{" "}
                  <span
                    className={`font-semibold ${
                      product.variantCombinations.reduce(
                        (sum, combo) => sum + combo.stock,
                        0
                      ) > 10
                        ? "text-green-600"
                        : product.variantCombinations.reduce(
                            (sum, combo) => sum + combo.stock,
                            0
                          ) > 0
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {product.variantCombinations.reduce(
                      (sum, combo) => sum + combo.stock,
                      0
                    )}
                  </span>
                </p>

                <p className="text-xs text-gray-400 italic">
                  {getVariantSummary(product)}
                </p>

                {product.productTags.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      Tags:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {product.productTags
                        .filter((pt) => !pt.tag.parent)
                        .map((pt) => (
                          <Badge key={pt.tag.id} variant="outline">
                            {pt.tag.name}
                          </Badge>
                        ))}
                    </div>

                    <p className="text-xs text-muted-foreground font-medium">
                      Subtags:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {product.productTags
                        .filter((pt) => pt.tag.parent)
                        .map((pt) => (
                          <Badge key={pt.tag.id} variant="secondary">
                            {pt.tag.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-4">
                  <Button
                    onClick={() =>
                      router.push(`/dashboard/edit-product/${product.id}`)
                    }
                    className="w-full"
                  >
                    Update Product
                  </Button>
                  <Button
                    onClick={() =>
                      router.push(`/dashboard/edit-variants/${product.id}`)
                    }
                    variant="outline"
                    className="w-full"
                  >
                    Update Variants
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
