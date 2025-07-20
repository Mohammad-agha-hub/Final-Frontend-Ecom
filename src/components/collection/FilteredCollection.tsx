"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, ShoppingCart } from "lucide-react";
import { AllProducts } from "@/components/utilities/ClothesData";
import { useFilterStore } from "@/utils/FilterStore";
import { Product } from "../utilities/types"; // Make sure path is correct
import dynamic from "next/dynamic";

const ProductModal = dynamic(()=>import('../modal/ProductModal'),{
  ssr:false,
  loading:()=>null
})
type FilteredCollectionProps = {
  columns: number;
  collection: string;
};

const FilteredCollection = ({
  columns,
  collection,
}: FilteredCollectionProps) => {
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const filters = useFilterStore((state) => state.filters);
  const sortBy = useFilterStore((state) => state.sortBy);
  
  let products:Product[] = AllProducts.filter((product) => {
    if (product.subcategory !== collection) return false;

    const matchesPrice =
      !filters.price.length ||
      filters.price.some((range: string) => {
        if (range === "9000+") return +product.price >= 9000;
        const [min, max] = range.split("-").map(Number);
        return +product.price >= min && +product.price <= max;
      });

    const matchesColor =
      !filters.color.length || filters.color.includes(product.color??'');

    const matchesType =
      !filters.type.length || filters.type.includes(product.type);

    const matchesSize =
      !filters.size.length || filters.size.includes(product.size??'');

    const matchesPieces =
      !filters.pieces.length || filters.pieces.includes(product.pieces.toString());

    return (
      matchesPrice &&
      matchesColor &&
      matchesType &&
      matchesSize &&
      matchesPieces
    );
  });

  products = [...products].sort((a, b) => {
    switch (sortBy) {
      case "Price: Low to High":
        return +a.price - +b.price;
      case "Price: High to Low":
        return +b.price - +a.price;
      case "Newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const gridColsClass: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  return (
    <>
      <div className="p-4 max-w-screen overflow-x-hidden">
        <span className="text-sm text-gray-600 mb-4 block">
          Products Available: {products.length}
        </span>
        <div className="grid gap-6 w-full product-grid transition-all duration-300 ease-in-out">
          <div className={`grid ${gridColsClass[columns]} gap-6`}>
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="cursor-pointer"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
      />
    </>
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
        <Image
          src={product.image[0]}
          alt="Front"
          fill
          className="object-cover"
        />
        <motion.div
          className="absolute inset-0 z-10"
          style={{ pointerEvents: "none" }}
          initial={false}
          animate={{
            opacity: hovered ? 1 : 0,
            scale: hovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src={product.image[1]}
            alt="Back"
            fill
            className="object-cover"
          />
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-4 pointer-events-none"
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : -40 }}
        transition={{ duration: 0.8 }}
      >
        <div className="pointer-events-auto">
          <HoverIconButton label="Quick View" icon={<Eye size={18} />} />
        </div>
        <div className="pointer-events-auto">
          <HoverIconButton
            label="Add to Cart"
            icon={<ShoppingCart size={18} />}
          />
        </div>
      </motion.div>

      <div className="mt-3 px-1 pb-4 text-center">
        <h1 className="text-sm px-2 font-medium truncate text-gray-900">
          {product.name}
        </h1>
        <span className="text-sm text-gray-700">Rs{product.price}</span>
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
