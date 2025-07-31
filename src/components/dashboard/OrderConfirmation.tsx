"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function OrderConfirmation() {
  const router = useRouter()

  const handleClick = ()=>{
    router.push('/')
  }
  return (
    <div className="h-150 flex flex-col md:flex-row items-center justify-center px-6 md:px-10 py-12 space-y-10 md:space-y-0 md:space-x-12 max-w-6xl mx-auto">
      {/* Content */}
      <div className="flex flex-col justify-center gap-6 text-center md:text-left">
        <div className="flex items-center justify-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-center font-bold">
            Thank you for your purchase!
          </h1>
        </div>
        <div className="flex items-center justify-center">
          <p className=" text-sm sm:text-base md:text-lg max-w-xl mx-auto md:mx-0 text-center">
            Your order will be processed within 24 hours during working days.
            We’ll notify you by email or phone once your order has been shipped.
          </p>
        </div>
        <div className="flex justify-center items-center">
          <button
            className="mt-6 w-50 sm:w-60 px-4 py-4 cursor-pointer bg-orange-600 hover:bg-orange-700 text-white rounded-md font-semibold transition duration-200"
            onClick={handleClick}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
