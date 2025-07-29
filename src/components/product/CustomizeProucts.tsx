"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useSelectedOptionsStore } from "@/utils/SizeStore";
import { Product, VariantCombination } from "../utilities/types";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

const CustomizeProducts = ({ product }: { product: Product }) => {
  const [wished, setWished] = useState(false);
  const [loading,setLoading] = useState(false)
  const {
    selectedColor,
    selectedSize,
    setSelectedColor,
    setSelectedSize,
    setCombination,
    combination,
  } = useSelectedOptionsStore();
  const {data:session} = useSession()
  const handleWishlist = async()=>{
    if(!session) return toast.error("You must be logged in")
      const nextWished = !wished;
    setWished(nextWished)
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlist`,{
        method: wished?"DELETE":"POST",
        headers:{Authorization:`Bearer ${session?.user.backendToken}`,
                "Content-Type":"application/json"
        },
        body:JSON.stringify({productId:product.id})
      });
      if(!res.ok) toast.error(`Failed to update wishlist!`)
    } catch (error) {
      console.error(error)
      toast.error(`Something went wrong while updating wishlist!`)
      setWished(!nextWished)
    }
    finally{
      setLoading(false)
    }
  }

  // Reset selections when product changes
  useEffect(() => {
    setSelectedColor("");
    setSelectedSize("");
    setCombination(null);
  }, [product.id,setSelectedColor,setCombination,setSelectedSize]);

  // Create a map of color -> size -> combination
  const { colorSizeMap, colorStockMap, sizeStockMap } = useMemo(() => {
    const colorSizeMap: Record<string, Record<string, VariantCombination>> = {};
    const colorStockMap: Record<string, number> = {};
    const sizeStockMap: Record<string, number> = {};

    product.variantCombinations?.forEach((combo) => {
      if (!combo || !Array.isArray(combo.variants)) return;

      const colorVariant = combo.variants.find(
        (v) => v?.variant?.key === "Color"
      );
      const sizeVariant = combo.variants.find(
        (v) => v?.variant?.key === "Size"
      );

      if (!colorVariant || !sizeVariant) return;

      const color = colorVariant.variant.value;
      const size = sizeVariant.variant.value;

      // Build color -> size -> combo map
      if (!colorSizeMap[color]) colorSizeMap[color] = {};
      colorSizeMap[color][size] = combo;

      // Calculate total stock per color
      colorStockMap[color] = (colorStockMap[color] || 0) + combo.stock;

      // Calculate total stock per size
      sizeStockMap[size] = (sizeStockMap[size] || 0) + combo.stock;
    });

    return { colorSizeMap, colorStockMap, sizeStockMap };
  }, [product]);
  
  // Get available colors (filter out colors with no stock)
  const availableColors = useMemo(() => {
    return Object.keys(colorSizeMap).filter(color => 
      colorStockMap[color] > 0 && // Has stock
      (!selectedSize || Object.keys(colorSizeMap[color]).includes(selectedSize)) // Size compatible
  )}, [colorSizeMap, colorStockMap, selectedSize]);

  // Get available sizes for selected color (filter out sizes with no stock)
  const availableSizes = useMemo(() => {
    if (!selectedColor) return [];
    return Object.keys(colorSizeMap[selectedColor] || [])
  }, [selectedColor, colorSizeMap]);

  // Get predefined sizes with availability info
  const predefinedSizes = useMemo(() => {
    return ["XS", "S", "M", "L", "XL"].map(size => ({
      value: size,
      available: availableSizes.includes(size),
      stock: sizeStockMap[size] || 0,
    }));
  }, [availableSizes, sizeStockMap]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(""); // Reset size when color changes

    // Find first available size for this color
    const firstAvailableSize = Object.keys(colorSizeMap[color]).find(size => 
      colorSizeMap[color][size].stock > 0
    );

    if (firstAvailableSize) {
      setSelectedSize(firstAvailableSize);
      setCombination(colorSizeMap[color][firstAvailableSize]);
    } else {
      setCombination(null);
    }
  };

  const handleSizeSelect = (size: string) => {
    if (!selectedColor) return;
    setSelectedSize(size);
    setCombination(colorSizeMap[selectedColor]?.[size] || null);
  };

  // Show stock information for selected combination
  const stockInfo = useMemo(() => {
    if (!combination) return null;
    
    if (combination.stock > 30) return "In Stock";
    if (combination.stock > 0) return `Only ${combination.stock} left!`;
    return "Out of Stock";
  }, [combination]);

  return (
    <div className="flex flex-col gap-6">
      {/* Color Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Choose a Color</h4>
          <div
            onClick={handleWishlist}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-sm text-gray-700 group-hover:text-black transition">
             {wished?"Remove from wishlist":"Add to wishlist"}
            </span>
            <Heart
              className={`w-5 h-5 ${
                wished
                  ? "fill-red-500 text-red-600 heart-popup"
                  : "text-gray-400"
              }`}
            />
          </div>
        </div>
        <div className="flex gap-3">
          {availableColors.map((color) => {
            const isWhite = color.toLowerCase() === "white";
            const isSelected = selectedColor === color;
            const stock = colorStockMap[color] || 0;

            return (
              <div
                key={color}
                onClick={() => stock > 0 && handleColorSelect(color)}
                className={`
                  relative w-8 h-8 rounded-full cursor-pointer ring-2 transition
                  ${
                    isSelected
                      ? "ring-orange-400 scale-110"
                      : stock > 0
                      ? "ring-transparent hover:ring-orange-200"
                      : "opacity-50 cursor-not-allowed"
                  }
                `}
                style={{
                  backgroundColor: color.toLowerCase(),
                  border: isWhite ? "1px solid orange" : "none",
                }}
              >
                {stock <= 0 && (
                  <div className="absolute inset-0 bg-white/50 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Size Selector Title + Wishlist */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-10">
          <h4 className="font-medium">Choose a Size</h4>
          {stockInfo && combination && (
            <span
              className={`text-sm ${
                combination.stock > 0 ? "text-orange-500" : "text-red-500"
              }`}
            >
              {stockInfo}
            </span>
          )}
        </div>
      </div>

      {/* Sizes */}
      <ul className="flex justify-between items-center gap-3">
        <div className="flex gap-3">
          {predefinedSizes.map(({ value: size, available, stock }) => {
            const isSelected = selectedSize === size;
            const isDisabled = !available || stock <= 0;

            return (
              <li
                key={size}
                onClick={() => !isDisabled && handleSizeSelect(size)}
                className={`
                  relative w-10 h-10 flex items-center justify-center text-sm font-medium 
                  rounded-full cursor-pointer transition select-none
                  ${
                    isDisabled
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : isSelected
                      ? "bg-black text-white ring-2 ring-orange-400"
                      : "text-gray-500 ring-1 ring-gray-400 hover:text-gray-800 hover:ring-gray-800"
                  }
                `}
              >
                {size}
                {isDisabled && (
                  <div className="absolute w-full h-px bg-gray-500 top-1/2 transform -rotate-45" />
                )}
              </li>
            );
          })}
        </div>
      </ul>
    </div>
  );
};

export default CustomizeProducts;