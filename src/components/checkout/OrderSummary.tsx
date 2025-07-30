'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/utils/CartStore';
import { useSettingsStore } from '@/utils/shippingStore';
import { useSession } from "next-auth/react";

  
interface OrderSummaryProps {
  onCouponApplied?: (code: string, amount: number) => void;
  isInternational:boolean
}
const OrderSummary:React.FC<OrderSummaryProps> = ({onCouponApplied,isInternational}) => {
  
  const [couponCode,setCouponCode] = useState('')
  const [discountAmount,setDiscountAmount] = useState(0)
  const [couponError,setCouponError] = useState('')
  const {shippingRate,dhlCharges,currency} = useSettingsStore()
  const {items} = useCartStore() 
 const {data:session} = useSession()
  const subtotal = items.reduce((sum, item) => {
    const discount = item.product.discount || 0;
    const discountedPrice =
      item.product.price - item.product.price * (discount / 100);
    return sum + Math.round(discountedPrice) * item.quantity;
  }, 0);
  const shippingCharges = isInternational?dhlCharges:shippingRate
  const total = Math.max(0, subtotal + shippingCharges - discountAmount);
  
  const applyCoupon = async()=>{
    if(!couponCode){
      setCouponError('Please enter a coupon code')
      return;
    } 
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/coupons/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.backendToken}`,
          },
          body: JSON.stringify({ code: couponCode }),
        }
      );
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
    <div className="hidden lg:flex lg:flex-col w-1/2 p-6 space-y-6 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Your Order</h2>

      {/* Cart Items */}
      {items.map((item) => (
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
              loading="lazy"
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
              <p className="text-xs text-gray-500 mt-1">Size: {item.size}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>Color:</span>
                <span
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: item.color ?? undefined }}
                  title={item.color ?? ""}
                />
              </div>

              <span className="font-semibold text-sm pt-2 xl:hidden">
                {`${currency}`}{" "}
                {Math.round(
                  item.product.price -
                    item.product.price * ((item.product.discount ?? 0) / 100)
                ).toLocaleString()}
              </span>
            </div>
            <div className="text-right hidden xl:block font-semibold">
              {`${currency}`}{" "}
              {Math.round(
                item.product.price -
                  item.product.price * ((item.product.discount ?? 0) / 100)
              ).toLocaleString()}
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
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
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
          <span className="font-medium">{`${currency} ${subtotal}`}</span>
        </div>
        <div className="flex justify-between">
          <span>Items</span>
          <span>{items.reduce((count, item) => count + item.quantity, 0)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{`${currency} ${shippingCharges}`}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>{`${currency} ${discountAmount}`}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-semibold border-t pt-3">
          <span>Total</span>
          <span>{`${currency} ${total}`}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
