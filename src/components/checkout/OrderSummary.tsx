'use client';

import React from 'react';
import Image from 'next/image';
import { useCartStore } from "@/utils/CartStore";


const OrderSummary = () => {
  const cartItems = useCartStore((state)=>state.items)
  const subtotal = cartItems.reduce((sum, item) => sum + +item.product.price * item.quantity, 0);
  const shipping = 150;
  const total = subtotal + shipping;

  return (
    <div className="hidden lg:flex lg:flex-col w-1/2 p-6 space-y-6 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Your Order</h2>

      {/* Cart Items */}
      {cartItems.map((item) => (
        <div
          key={item.id}
          className="flex gap-4 relative border rounded p-4 bg-white"
        >
          {/* Image with Quantity Badge */}
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

          {/* Details */}
          <div className="flex justify-between w-full">
            <div className="flex pl-2 flex-col">
              <p className="text-sm font-medium">{item.product.name}</p>
              <p className="text-xs text-gray-500 mt-1">Size: Medium</p>
              <span className='font-semibold text-sm pt-2 xl:hidden'>Rs {item.product.price}</span>
            </div>
            <div className="text-right hidden xl:block font-semibold">
              Rs {item.product.price}
            </div>
          </div>
        </div>
        
      ))}

      {/* Discount */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Discount code"
          className="w-[80%] border border-gray-300 rounded px-4 py-3 focus:ring-1 focus:ring-[#1773b0] focus:outline-none"
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
            {cartItems.reduce((count, item) => count + item.quantity, 0)}
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
  );
};

export default OrderSummary;
