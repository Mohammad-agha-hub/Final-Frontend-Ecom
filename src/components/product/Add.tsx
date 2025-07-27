"use client";

import React, { useState, useEffect } from "react";
import { useCartStore } from "@/utils/CartStore";
import { useSelectedOptionsStore } from "@/utils/SizeStore";
import { Product } from "../utilities/types";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Add = ({ product }: { product: Product }) => {
  const { data: session } = useSession();
  const {
    selectedSize,
    selectedColor,
    combination,
  } = useSelectedOptionsStore();
  const router = useRouter()
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  // Calculate max stock and price
  const maxStock = combination?.stock ?? product.stock;
  const discount = product.discount || 0;
  const discountedPrice =
    discount > 0
      ? Math.round(product.price * (1 - discount / 100))
      : product.price;

  // Reset quantity when combination changes
  useEffect(() => {
    setQuantity(1);
  }, [combination?.id]);

  // Fix hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleQuantity = (type: "increase" | "decrease") => {
    if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
    if (type === "increase" && quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleCart = async () => {
    if(!session?.user.backendToken){
      router.push('/login')
    }
    if (!selectedSize) {
      toast.warning("Please select a size");
      return;
    }
    if (!selectedColor) {
      toast.warning("Please select a color");
      return;
    }
    if (!combination) {
      toast.error("Invalid variant selection");
      return;
    }
    if (!session?.user.backendToken) {
      toast.warning("Please login to continue");
      return;
    }
    if (maxStock <= 0) {
      toast.error("This item is out of stock");
      return;
    }

    try {
      setLoading(true);
      await addToCart(
        {
          id: product.id,
          name: product.name,
          image: product.images?.[0]?.url || "",
          price: discountedPrice,
          discount: product.discount || 0,
        },
        quantity,
        combination.id,
        selectedSize,
        selectedColor,
        session.user.backendToken
      );

     

      toast.success("Added to cart successfully!");
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not mounted (SSR hydration)
  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-medium">Choose a Quantity</h4>
      <div className="flex justify-between items-center ">
        <div className="flex items-center gap-4">
          {/* Quantity Selector */}
          <div className="bg-gray-100 py-2 px-4 rounded-3xl flex items-center justify-between w-32">
            <button
              onClick={() => handleQuantity("decrease")}
              disabled={quantity <= 1}
              className="text-xl p-[1px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="font-medium">{quantity}</span>
            <button
              onClick={() => handleQuantity("increase")}
              disabled={quantity >= maxStock}
              className="text-xl p-[1px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

         
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleCart}
          disabled={loading || maxStock <= 0}
          className="w-36 text-sm rounded-3xl bg-black text-white py-3 px-4 
            transition-transform duration-200 hover:scale-105 
            disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          aria-label={maxStock <= 0 ? "Out of stock" : "Add to cart"}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Adding...
            </span>
          ) : (
            "Add to Cart"
          )}
        </button>
      </div>
    </div>
  );
};

export default Add;
