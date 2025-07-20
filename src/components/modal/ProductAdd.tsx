"use client";

// import { useCartStore } from "@/utils/CartStore";
import { useSelectedOptionsStore } from "@/utils/SizeStore";
import React, { useState } from "react";
import { Product } from "../utilities/types";

const ProductAdd = ({ product }: { product: Product }) => {
  
  const [quantity, setQuantity] = useState(1);
  const selectedSize = useSelectedOptionsStore((state) => state.selectedSize);
  // const addToCart = useCartStore((state) => state.addToCart);

  const handleQuantity = (type: "increase" | "decrease") => {
    if (type === "decrease" && quantity > 1) setQuantity((prev) => prev - 1);
    if (type === "increase" && quantity < product.stock)
      setQuantity((prev) => prev + 1);
  };

  const handleCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3">
        <h4 className="font-medium">Choose a Quantity</h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 py-2 px-4 rounded-3xl flex items-center justify-between w-32">
              <button
                onClick={() => handleQuantity("decrease")}
                className="cursor-pointer text-xl"
              >
                -
              </button>
              {quantity}
              <button
                onClick={() => handleQuantity("increase")}
                className="cursor-pointer text-xl"
              >
                +
              </button>
            </div>
            {product.stock > 0 ? (
              <div className="text-xs">
                Only{" "}
                <span className="text-orange-500">{product.stock} items</span>{" "}
                left!
                <br />
                Don&apos;t miss it
              </div>
            ) : (
              <div className="text-xs">
                <span>Out of Stock</span>
              </div>
            )}

            {/* First Add to Cart */}
            <button
              onClick={handleCart}
              disabled={product.stock <= 0}
              className="first-cart-btn cursor-pointer w-36 mb-5 mt-5 text-sm rounded-3xl ring-1 ring-orange-400 text-orange-400 py-3 px-4 hover:bg-orange-400 hover:text-white"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Second Add to Cart */}
      <div className="flex justify-center">
        <button
          onClick={handleCart}
          disabled={product.stock <= 0}
          className="cart-btn cursor-pointer w-36 mt-5 mb-3 text-sm rounded-3xl ring-1 ring-orange-400 text-orange-400 py-3 px-4 hover:bg-orange-400 hover:text-white"
        >
          Add to Cart
        </button>
      </div>

      <div className="h-[2px] bg-gray-100" />
    </div>
  );
};

export default ProductAdd;
