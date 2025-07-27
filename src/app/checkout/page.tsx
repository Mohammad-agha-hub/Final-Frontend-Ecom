"use client"

import CheckoutDetail from '@/components/checkout/CheckoutDetail'
import OrderSummary from '@/components/checkout/OrderSummary'
import OrderSummaryTop from '@/components/checkout/OrderSummaryTop'
import React, { useState } from 'react'



const Checkout = () => {
  const [couponCode,setCouponCode] = useState('')
  const [discountAmount,setDiscountAmount] = useState(0)
  const handleCouponApplied = (code:string,amount:number)=>{
    setCouponCode(code)
    setDiscountAmount(amount)
  }
  return (
    <div className="checkout flex flex-col lg:flex-row px-[5%] sm:px-[10%] md:px-[7%] lg:px[10%] xl:px-[5%] gap-10">
      <div className="lg:hidden">
        <OrderSummaryTop onCouponApplied={handleCouponApplied} />
      </div>
      <CheckoutDetail couponCode={couponCode} discountAmount={discountAmount} />
      <OrderSummary onCouponApplied={handleCouponApplied} />
    </div>
  );
}

export default Checkout
