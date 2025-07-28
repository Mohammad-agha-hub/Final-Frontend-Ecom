"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {  ShoppingCart } from "lucide-react";
import { useFilterStore } from "@/utils/FilterStore";
import { Product } from "../utilities/types";
import { useRouter } from "next/navigation";

type FilteredCollectionProps = {
  columns: number;
  items: Product[];
  search:string
};

const FilteredCollection = ({ columns, items,search }: FilteredCollectionProps) => {
 
  const filters = useFilterStore((state) => state.filters);
  const sortBy = useFilterStore((state) => state.sortBy);
  const router = useRouter();

  let products: Product[] = items.filter((item) => {
    const effectivePrice = item.price - Math.round((item.price*item.discount)/100)
    const matchesPrice =
      !filters.price.length ||
      filters.price.some((range: string) => {
        if (range === "9000+") return effectivePrice >= 9000;
        const [min, max] = range.split("-").map(Number);
        return effectivePrice >= min && effectivePrice <= max;
      });
      if(item.variantCombinations && item.variantCombinations.length>0){
        
      }
    const variantValues = item.variantCombinations?.flatMap((combo) =>
      combo.variants.map((v) => ({
        key: v.variant.key,
        value: v.variant.value,
      }))
    );

    const matchesColor =
      !filters.color.length ||
      variantValues?.some(
        (v) =>
          v.key.toLowerCase() === "color" && filters.color.includes(v.value)
      );

    const matchesSize =
      !filters.size.length ||
      variantValues?.some(
        (v) => v.key.toLowerCase() === "size" && filters.size.includes(v.value)
      );

    return matchesPrice && matchesColor && matchesSize;
  });

  products = [...products].sort((a, b) => {
    const priceA = a.price - Math.round((a.price * a.discount)/100);
    const priceB = b.price - Math.round((b.price * b.discount)/100);

    switch (sortBy) {
      case "Price: Low to High":
        return priceA - priceB;
      case "Price: High to Low":
        return priceB - +priceA;
      case "Newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  const handleProductClick = (item: Product) => {
    
    router.push(`/products/${item.slug}`);
    router.refresh();
  };

  const gridColsClass: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  return (
    <div className="p-4 max-w-screen overflow-x-hidden pb-10">
      <div className="flex justify-between items-center">
        <div className="flex justify-between px-2 w-full">
          <span className="text-sm text-gray-600 mb-4 block">
            Products Available: {products.length}
          </span>
          <span className="text-sm text-gray-600 mb-4 block">
            Search Result for &quot;{search}&quot;{" "}
          </span>
        </div>
      </div>
      <div className="grid gap-6 w-full product-grid transition-all duration-300 ease-in-out">
        <div className={`grid ${gridColsClass[columns]} gap-6`}>
          {products.map((item) => (
            <div
              key={item.id}
              onClick={() => handleProductClick(item)}
              className="cursor-pointer"
            >
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative group w-full overflow-hidden rounded-lg shadow-md border border-gray-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] w-full">
        {product.images && product.images.length > 0 && (
          <Image
            src={product.images?.[1]?.url}
            alt="Front"
            fill
            loading="lazy"
            className="object-cover"
          />
        )}

        <motion.div
          className="absolute inset-0 z-10"
          style={{ pointerEvents: "none" }}
          initial={false}
          animate={{
            opacity: hovered ? 1 : 0,
            scale: hovered ? 1.02 : 1,
          }}
          transition={{ duration: 0.6 }}
        >
          {product.images && product.images.length > 0 && (
            <Image
              src={product.images?.[0]?.url}
              alt="Back"
              fill
              loading="lazy"
              className="object-cover"
            />
          )}
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-4 pointer-events-none"
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : -40 }}
        transition={{ duration: 0.8 }}
      >
        <div className="pointer-events-auto">
          <HoverIconButton
            label="Add to Cart"
            icon={<ShoppingCart size={18} />}
          />
        </div>
      </motion.div>

      <div className="mt-3 px-1 pb-4 text-center">
        <h1 className=" text-[10px] sm:text-sm px-2 font-medium truncate text-gray-900">
          {product.name}
        </h1>
        <div className="flex justify-center gap-1">
          <span className="text-[10px] sm:text-sm text-gray-900">
            Rs{" "}
            {product.price -
              Math.round((product.price * product.discount) / 100)}
          </span>
          {product.discount > 0 && (
            <>
              <span className="text-[10px] sm:text-sm text-gray-600 line-through">
                Rs {product.price}
              </span>
              <span className="text-[10px] sm:text-sm text-red-400">{product.discount}%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

type HoverIconButtonProps = {
  icon: React.ReactNode;
  label: string;
};

const HoverIconButton = ({ icon, label }: HoverIconButtonProps) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      className="relative flex items-center justify-center w-36 h-10 text-sm cursor-pointer rounded-full bg-white transition-colors duration-700 overflow-hidden pointer-events-auto"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.span
        className="absolute z-10 text-black"
        initial={false}
        animate={{ opacity: hovered ? 0 : 1, y: hovered ? -10 : 0 }}
        transition={{ duration: 0.7 }}
      >
        {hovered ? "" : label}
      </motion.span>
      <motion.div
        className="absolute inset-0 z-0"
        animate={{ backgroundColor: hovered ? "#000000" : "#ffffff" }}
        transition={{ duration: 0.7 }}
      />
      <motion.span
        className="absolute z-10 text-white"
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : -20 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.span>
    </button>
  );
};

export default FilteredCollection;
