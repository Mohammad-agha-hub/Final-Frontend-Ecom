"use client";

import React, { useState } from "react";
import { useCartStore } from "@/utils/CartStore";
import { useSelectedOptionsStore } from "@/utils/SizeStore";
import { Product } from "../utilities/types";
import { useSession } from "next-auth/react";

const Add = ({ product }: { product: Product }) => {
  const [quantity, setQuantity] = useState(1);
  const { selectedSize, selectedColor } = useSelectedOptionsStore();
 const { data: session } = useSession();
  const { addToCart } = useCartStore();
 
  const handleQuantity = (type: "increase" | "decrease") => {
    if (type === "decrease" && quantity > 1) setQuantity((prev) => prev - 1);
    if (type === "increase" && quantity < product.stock)
      setQuantity((prev) => prev + 1);
  };

  const handleCart = async () => {
    if (!selectedSize) return alert("Please select a size");
    if (!selectedColor) return alert("Please select a color");

    if (!session?.user.backendToken) return alert("Please login to continue");
    await addToCart(product.id, quantity, session.user.backendToken);
    
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-medium">Choose a Quantity</h4>
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 py-2 px-4 rounded-3xl flex items-center justify-between w-32">
            <button
              onClick={() => handleQuantity("decrease")}
              className="text-xl"
            >
              -
            </button>
            {quantity}
            <button
              onClick={() => handleQuantity("increase")}
              className="text-xl"
            >
              +
            </button>
          </div>
          {product.stock > 0 ? (
            <div className="text-xs">
              Only{" "}
              <span className="text-orange-500">{product.stock} items</span>{" "}
              left!
            </div>
          ) : (
            <div className="text-xs text-red-500">Out of Stock</div>
          )}
        </div>

        <button
          onClick={handleCart}
          disabled={product.stock <= 0}
          className="page-first-btn ml-2 w-36 text-sm rounded-3xl ring-1 ring-orange-400 text-orange-400 py-2 px-4 hover:bg-orange-400 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-700"
        >
          Add to Cart
        </button>
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={handleCart}
          disabled={product.stock <= 0}
          className="page-second-btn w-36 text-sm rounded-3xl ring-1 ring-orange-400 text-orange-400 py-3 px-4 hover:bg-orange-400 hover:text-white disabled:cursor-not-allowed disabled:bg-pink-200 disabled:text-white"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Add;
