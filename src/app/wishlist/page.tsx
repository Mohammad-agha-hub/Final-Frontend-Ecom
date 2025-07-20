"use client";

import React from 'react';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import { useWishlistStore } from '@/utils/WishlistStore';

const WishlistPage = () => {
  const wishedProducts = useWishlistStore((state)=>state.wishlist)
  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="xl:text-4xl lg:text-3xl md:text-2xl sm:text-xl text-xl font-bold text-gray-800 flex items-center gap-2 mb-10">
          <Heart className="text-red-500 w-8 h-8" /> Your Wishlist
        </h1>

        {wishedProducts.length === 0 ? (
          <p className="text-gray-600 text-lg">Your wishlist is empty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishedProducts.map((item) => (
              <div
                key={item.id}
                className="bg-white shadow-md rounded-2xl p-5 flex flex-col items-center text-center hover:shadow-xl transition-all"
              >
                <div className="relative w-40 h-40 mb-4">
                  <Image
                    src={item.image[0]}
                    alt={item.name}
                    fill
                    className="object-cover object-top rounded-lg"
                  />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  {item.name}
                </h2>
                <p className="text-red-600 font-bold text-lg mb-4">
                  Rs {item.price}
                </p>
                <div className="flex gap-3">
                  <button className="bg-black text-white cursor-pointer px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
                    View Product
                  </button>
                  <button className="bg-gray-200 cursor-pointer text-gray-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-300 transition">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
