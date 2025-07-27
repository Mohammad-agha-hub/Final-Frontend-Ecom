"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/utils/CartStore";

interface OrderSummaryProps{
  onCouponApplied?:(code:string,amount:number)=>void
}

const OrderSummaryTop:React.FC<OrderSummaryProps> = ({onCouponApplied}) => {
  const [couponCode,setCouponCode] = useState('')
  const [discountAmount,setDiscountAmount] = useState(0)
  const [couponError,setCouponError] = useState('')
  const {items} = useCartStore()
  const [openOrder, setOpenOrder] = useState(false);
  
   const subtotal = items.reduce((sum, item) => {
    const discount = item.product.discount || 0;
    const discountedPrice =
      item.product.price - item.product.price * (discount / 100);
    return sum + Math.round(discountedPrice) * item.quantity;
  }, 0);

  const shipping = 150;
  const total = Math.max(0, subtotal + shipping - discountAmount);
  const applyCoupon = async()=>{
    if(!couponCode){
      setCouponError('Please enter a coupon code')
      return;
    } 
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/coupons/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json()
      if(!data.success){
        setCouponError(data.message || 'Invalid Coupon')
        setDiscountAmount(0)
        if(onCouponApplied)onCouponApplied("",0)
        return;
      }
      const {discount,type} = data.coupon;
      let calculatedDiscount = 0;
      if(type==='PERCENTAGE'){
        calculatedDiscount = (subtotal * discount) / 100;
      }
      else if(type==='FIXED'){
        calculatedDiscount = discount
      }
    const finalDiscount = Math.min(calculatedDiscount,subtotal)
    setDiscountAmount(finalDiscount)
      setCouponError('')
      if(onCouponApplied){
        onCouponApplied(couponCode,finalDiscount)
      }
    } catch (error) {
      console.error('coupon error',error)
      setCouponError('Failed to apply coupon')
      if(onCouponApplied) onCouponApplied('',0)
    }
    }
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
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 relative border rounded p-4 bg-white"
                >
                  <div className="w-20 h-24 relative">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${item.product.image}`}
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
                        Size: {item.size}
                      </p>
                      <p className="text-xs text-gray-900 mt-1">
                        Color: {item.color}
                      </p>
                      <p className="text-sm sm:text-base text-left pt-2 font-semibold text-gray-600">
                        Rs{" "}
                        {Math.round(
                          item.product.price -
                            item.product.price *
                              ((item.product.discount ?? 0) / 100)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Discount */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Discount code"
                  className="w-[80%] sm:text-10 text-sm border border-gray-300 rounded px-4 py-3 focus:ring-1 focus:ring-[#1773b0] focus:outline-none"
                />
                <button
                  onClick={applyCoupon}
                  className="bg-[#1773b0bd] text-white px-8 py-3 rounded hover:bg-[#1773b0]"
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="text-red-500 text-sm mt-1">{couponError}</p>
              )}
              {/* Summary Info */}
              <div className="text-sm text-gray-800 space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">Rs {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>
                    {items.reduce((count, item) => count + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Rs {shipping}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>Rs {discountAmount}</span>
                  </div>
                )}
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
