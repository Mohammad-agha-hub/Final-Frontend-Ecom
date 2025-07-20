"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/utils/CartStore";

const OrderSummaryTop = () => {
  const cartItems = useCartStore((state)=>state.items)
  const [openOrder, setOpenOrder] = useState(false);
  const subtotal = cartItems.reduce((sum, item) => sum + +item.product.price * item.quantity, 0);
  const shipping = 150;
  const total = subtotal + shipping;

  return (
    <div className="w-full">
      {/* Toggle Heading */}
      <div className="lg:hidden flex justify-between px-8 gap-2 items-center w-full bg-gray-50 border border-gray-300 py-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setOpenOrder(!openOrder)}
        >
          <h2 className="text-sm text-blue-600 ml-1">Order Summary</h2>
          <ChevronDown
            className={`text-blue-600 transition-transform duration-300 ${
              openOrder ? "rotate-180" : ""
            }`}
            size={20}
          />
        </div>
        <h1 className="text-lg md:text-xl font-semibold">Rs {total}</h1>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {openOrder && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col justify-center p-6 space-y-6 bg-gray-50">
              {/* Cart Items */}
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 relative border rounded p-4 bg-white"
                >
                  <div className="w-20 h-24 relative">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded"
                    />
                    <div className="absolute -top-2 -right-2 bg-[#4c5c66] text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex justify-between w-full pt-2">
                    <div className="flex pl-2 flex-col">
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-gray-900 mt-1">
                        Size:Medium
                      </p>
                      <p className="text-sm sm:text-base text-left pt-2 font-semibold text-gray-600">Rs {item.product.price}</p>
                    </div>
                    
                  </div>
                </div>
              ))}

              {/* Discount */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Discount code"
                  className="w-[80%] sm:text-10 text-sm border border-gray-300 rounded px-4 py-3 focus:ring-1 focus:ring-[#1773b0] focus:outline-none"
                />
                <button className="bg-[#1773b0bd] text-white px-8 py-3 rounded hover:bg-[#1773b0]">
                  Apply
                </button>
              </div>

              {/* Summary Info */}
              <div className="text-sm text-gray-800 space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">Rs {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>
                    {cartItems.reduce(
                      (count, item) => count + item.quantity,
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Rs {shipping}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-3">
                  <span>Total</span>
                  <span>Rs {total}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderSummaryTop;
