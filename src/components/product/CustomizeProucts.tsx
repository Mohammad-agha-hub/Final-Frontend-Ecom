"use client";

import React, { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/utils/WishlistStore";
import { useSelectedOptionsStore } from "@/utils/SizeStore";
import { Product, VariantCombination, Variant } from "../utilities/types";

const CustomizeProducts = ({ product }: { product: Product }) => {
  const [wished, setWished] = useState(false);
  const {
    selectedColor,
    selectedSize,
    setSelectedColor,
    setSelectedSize,
    setCombination,
  } = useSelectedOptionsStore();

  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist
  );

  const predefinedSizes = ["XS", "S", "M", "L", "XL"];

  const comboMap = useMemo(() => {
    const map: Record<string, Record<string, VariantCombination>> = {};
    const variantCombinations = product.variantCombinations;

    if (!Array.isArray(variantCombinations)) return map;

    variantCombinations.forEach((combo: VariantCombination) => {
      const color = combo.variants.find(
        (v: Variant) => v.variant.key === "Color"
      )?.variant.value;
      const size = combo.variants.find((v: Variant) => v.variant.key === "Size")
        ?.variant.value;

      if (!color || !size) return;

      if (!map[color]) map[color] = {};
      map[color][size] = combo;
    });

    return map;
  }, [product]);

  const availableColors = useMemo(() => {
    if (!selectedSize) return Object.keys(comboMap);
    return Object.keys(comboMap).filter(
      (color) => comboMap[color][selectedSize]
    );
  }, [comboMap, selectedSize]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);

    // If current selected size is available in the new color
    if (comboMap[color]?.[selectedSize]) {
      const combo = comboMap[color][selectedSize];
      if (combo) {setCombination(combo)}
      else{setCombination(null)};
    } else {
      // Reset size + combo if not available
      setSelectedSize("");
      setCombination(null);
    }
  };

  const handleSizeSelect = (size: string) => {
    if (!selectedColor) return;
    setSelectedSize(size);
    const combo = comboMap[selectedColor]?.[size];
    if (combo){ setCombination(combo)}
    else{
      setCombination(null)
    }
      ;
  };

  const handleWishlist = () => {
    if (wished) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({ ...product, price: product.price.toString() });
    }
    setWished(!wished);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Color Selector */}
      <div className="flex flex-col gap-2">
        <h4 className="font-medium">Choose a Color</h4>
        <div className="flex gap-3">
          {availableColors.map((color) => {
            const isWhite = color.toLowerCase() === "white";
            return (
              <div
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`
                  w-8 h-8 rounded-full cursor-pointer ring-2 transition
                  ${
                    selectedColor === color
                      ? "ring-orange-400 scale-110"
                      : "ring-transparent hover:ring-orange-200"
                  }
                `}
                style={{
                  backgroundColor: color.toLowerCase(),
                  border: isWhite ? "1px solid orange" : "none",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Size Selector Title + Wishlist */}
      <div className="flex justify-between items-center gap-2">
        <h4 className="font-medium">Choose a Size</h4>
        <div
          onClick={handleWishlist}
          className="page-first-wished flex items-center gap-2 cursor-pointer group"
        >
          <span className="pt-1 text-sm text-gray-700 group-hover:text-black transition">
            Add to Wishlist
          </span>
          <Heart
            className={`mt-1 w-5 h-5 ${
              wished ? "fill-red-500 text-red-600 heart-popup" : "text-gray-400"
            }`}
          />
        </div>
      </div>

      {/* Sizes */}
      <ul className="flex justify-between items-center gap-3">
        <div className="flex gap-3">
          {predefinedSizes.map((size) => {
            const isAvailable =
              selectedColor && comboMap[selectedColor]?.[size];
            const isSelected = selectedSize === size;
            const isDisabled = selectedColor && !isAvailable;

            return (
              <li
                key={size}
                onClick={() => !isDisabled && handleSizeSelect(size)}
                className={`
                  w-10 h-10 flex items-center justify-center text-sm font-medium 
                  rounded-full cursor-pointer transition select-none
                  ${
                    isDisabled
                      ? "bg-gray-200 text-gray-500 line-through cursor-not-allowed"
                      : isSelected
                      ? "bg-black text-white ring-2 ring-orange-400"
                      : "text-gray-500 ring-1 ring-gray-400 hover:text-gray-800 hover:ring-gray-800"
                  }
                `}
              >
                {size}
              </li>
            );
          })}
        </div>

        {/* Second Wishlist Button */}
        <div
          onClick={handleWishlist}
          className="page-sec-wished flex items-center gap-2 cursor-pointer group"
        >
          <span className="text-sm text-gray-700 group-hover:text-black transition">
            Add to Wishlist
          </span>
          <Heart
            className={`w-5 h-5 ${
              wished ? "fill-red-500 text-red-600 heart-popup" : "text-gray-400"
            }`}
          />
        </div>
      </ul>
    </div>
  );
};

export default CustomizeProducts;
