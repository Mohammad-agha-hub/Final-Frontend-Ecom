'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

  interface Product{
    id:string;
    name:string;
    slug:string;
    price:number;
    image:string
  }
  interface CartItem{
    id:string;
    productId:string;
    combinationId:string;
    color:string;
    size:string;
    quantity:number;
    product:Product
  }
const OrderSummary = () => {
  
  const {data:session} = useSession()
  const token = session?.user.backendToken
  const [cartItems,setCartItems] = useState<CartItem[]>([])
  const [couponCode,setCouponCode] = useState('')
  const [discountAmount,setDiscountAmount] = useState(0)
  const [couponError,setCouponError] = useState('')

  const fetchItems = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setCartItems(data.cart.items)
    } catch (error) {
      
    }
    
  };
  
  useEffect(()=>{ 
    if(token){
      fetchItems();
    }
  },[token])
 
  const subtotal = cartItems.reduce((sum, item) => {
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
      setDiscountAmount(Math.min(calculatedDiscount,subtotal))
      setCouponError('')
    } catch (error) {
      console.error('coupon error',error)
      setCouponError('Failed to apply coupon')
    }
    }
  

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
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${item.product.image}`}
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
              <p className="text-xs text-gray-500 mt-1">Size: {item.size}</p>
              <p className="text-xs text-gray-500 mt-1">Color: {item.color}</p>
              <span className="font-semibold text-sm pt-2 xl:hidden">
                Rs{" "}
                {Math.round(
                  item.product.price -
                    item.product.price * (item.product.discount / 100)
                ).toLocaleString()}
              </span>
            </div>
            <div className="text-right hidden xl:block font-semibold">
              Rs{" "}
              {Math.round(
                item.product.price -
                  item.product.price * (item.product.discount / 100)
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
  );
};

export default OrderSummary;
