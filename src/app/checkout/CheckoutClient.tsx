"use client";

import CheckoutDetail from "@/components/checkout/CheckoutDetail";
import OrderSummary from "@/components/checkout/OrderSummary";
import OrderSummaryTop from "@/components/checkout/OrderSummaryTop";
import React, { useState } from "react";

interface SettingsProps {
    settings:{
        id:string;
        currency:string;
        shippingRate:number;
        dhlCharge:number;
        updatedAt:string
    }
}

const Checkout = ({settings}:SettingsProps) => {
    const [isInternational,setIsInternational] = useState(false)
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const handleCouponApplied = (code: string, amount: number) => {
    setCouponCode(code);
    setDiscountAmount(amount);
  };
  return (
    <div className="checkout flex flex-col lg:flex-row px-[5%] sm:px-[10%] md:px-[7%] lg:px[10%] xl:px-[5%] gap-10">
      <div className="lg:hidden">
        <OrderSummaryTop
          isInternational={isInternational}
          settings={settings}
          onCouponApplied={handleCouponApplied}
        />
      </div>
      <CheckoutDetail
        isInternational={isInternational}
        setIsInternational={setIsInternational}
        settings={settings}
        couponCode={couponCode}
        discountAmount={discountAmount}
      />
      <OrderSummary isInternational={isInternational} settings={settings} onCouponApplied={handleCouponApplied} />
    </div>
  );
};

export default Checkout;

