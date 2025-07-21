"use client";

import React, { useState } from "react";
import { useCartStore } from "@/utils/CartStore";
import { useSelectedOptionsStore } from "@/utils/SizeStore";
import { Product, VariantCombination } from "../utilities/types";
import { useSession } from "next-auth/react";

const Add = ({ product }: { product: Product }) => {
  const { data: session } = useSession();
  const {
    selectedSize,
    selectedColor,
    combination,
    setSelectedColor,
    setSelectedSize,
    setCombination,
  } = useSelectedOptionsStore();

  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartStore();
  const [loading,setLoading] = useState(false)
  const maxStock = combination?.stock ?? product.stock;
  const discount = product.discount || 0;
  const discountedPrice = discount>0?Math.round(product.price*(1-discount/100)):product.price

  const handleQuantity = (type: "increase" | "decrease") => {
    if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
    if (type === "increase" && quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleCart = async () => {
    if (!selectedSize) return alert("Please select a size");
    if (!selectedColor) return alert("Please select a color");
    if (!combination) return alert("Invalid variant selection");
    if (!session?.user.backendToken) return alert("Please login to continue");
    try {
      setLoading(true)
      const size = selectedSize;
      const color = selectedColor;

      // ✅ Deep clone combination before passing to addToCart
      const variantCopy: VariantCombination = {
        ...combination,
        id: combination.id, // ensure ID is preserved
      };

      await addToCart(
        {
          id: product.id,
          name: product.name,
          image: product.images?.[0]?.url || "",
          price: discountedPrice,
        },
        quantity,
        size,
        color,
        variantCopy,
        session.user.backendToken
      );

      // ✅ Reset quantity and selections after adding
      setQuantity(1);
      setSelectedColor("");
      setSelectedSize("");
      setCombination(null); 
    }
    finally{
      setLoading(false)
    } 
    
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-medium">Choose a Quantity</h4>
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 py-2 px-4 rounded-3xl flex items-center justify-between w-32">
            <button
              onClick={() => handleQuantity("decrease")}
              className="text-xl p-[1px] cursor-pointer"
            >
              -
            </button>
            {quantity}
            <button
              onClick={() => handleQuantity("increase")}
              className="text-xl p-[1px] cursor-pointer"
            >
              +
            </button>
          </div>
          {maxStock > 0 ? (
            <div className="text-xs">
              Only <span className="text-orange-500">{maxStock} items</span>{" "}
              left!
            </div>
          ) : (
            <div className="text-xs text-red-500">Out of Stock</div>
          )}
        </div>

        <button
          onClick={handleCart}
          disabled={loading || (combination?.stock ?? 0) <= 0}
          className="ml-2 w-36 text-sm rounded-3xl cursor-pointer bg-black text-white py-2 px-4 transition-transform duration-200 transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-700"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={handleCart}
          disabled={loading || (combination?.stock ?? 0) <= 0}
          className="page-second-btn w-36 text-sm rounded-3xl ring-1 ring-black bg-black text-white py-3 px-4 hover:scale-105 hover:bg-black hover:text-white transition-transform duration-200 disabled:cursor-not-allowed disabled:bg-pink-200 disabled:text-white"
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default Add;
