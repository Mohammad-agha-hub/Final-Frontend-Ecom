"use client";

import { Heart } from "lucide-react";
import React, { useState } from "react";
import { useWishlistStore } from "@/utils/WishlistStore";
import { useSelectedOptionsStore } from "@/utils/SizeStore";
import { Product } from "../utilities/types";

const sizes = ["Small", "Medium", "Large"];
const colors = ["Red", "Blue", "Green"]; // You can extract from product.variants later

const CustomizeProducts = ({ product }: { product: Product }) => {
  const [wished, setWished] = useState(false);
  const { selectedSize, selectedColor, setSelectedSize, setSelectedColor } =
    useSelectedOptionsStore();

const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist
  );

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
      {/* Size Selector */}
      <div className="flex flex-col gap-2">
        <h4 className="font-medium">Choose a Color</h4>
        <div className="flex gap-3">
          {colors.map((color) => (
            <div
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`
          w-8 h-8 rounded-full cursor-pointer ring-2 transition
          ${
            selectedColor === color
              ? "ring-orange-400 scale-110"
              : "ring-transparent hover:ring-orange-200"
          }
        `}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
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

      <ul className="flex justify-between items-center gap-3">
        <div className="flex gap-3">
          {sizes.map((size) => (
            <li
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`py-1.5 px-4 text-sm rounded-md cursor-pointer transition ${
                size === "Large"
                  ? "bg-orange-200 text-white opacity-70 cursor-not-allowed"
                  : selectedSize === size
                  ? "bg-orange-400 text-white ring-1 ring-orange-400"
                  : "ring-1 ring-orange-400 text-orange-400 hover:bg-orange-50"
              }`}
            >
              {size}
            </li>
          ))}
        </div>

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
