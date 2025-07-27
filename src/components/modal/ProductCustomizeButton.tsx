"use client"
import { Heart } from 'lucide-react';
import React, { useState } from 'react'
import { useWishlistStore } from '@/utils/WishlistStore';
import { Product } from '../utilities/types';
const sizes = ['Small','Medium','Large']
const ProductCustomizeButton = ({product}:{product:Product}) => {
    const [wished, setWished] = useState(false);
    // const selectedSize = useSelectedSizeStore((state)=>state.selectedSize)
    // const setSelectedSize = useSelectedSizeStore((state)=>state.setSelectedSize)
    const addToWishlist = useWishlistStore((state)=>state.addToWishlist)
    const removeFromWishlist = useWishlistStore((state)=>state.removeFromWishlist)
    const handleWishlist = ()=>{
      if(wished){
        removeFromWishlist(product.id)
      }
      else{
        addToWishlist({ ...product, price: product.price });
      }
      setWished(!wished)
    }
  return (
    <div>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Choose a size</h4>
        <div
          onClick={() => handleWishlist}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span className="text-sm font-medium text-gray-700 group-hover:text-black transition">
            Add to Wishlist
          </span>
          <Heart
            className={`w-5 h-5 cursor-pointer ${
              wished ? "fill-red-500 text-red-600" : "text-gray-400"
            }`}
          />
        </div>
      </div>

      {/* Sizes */}
      <ul className="flex gap-3 mt-5">
        {sizes.map((size) => (
          //${selectedSize===size?'bg-orange-400 text-white hover:bg-orange-500':''}
          <li
            className={`ring-1 ring-orange-400 text-orange-400 rounded-md py-1.5 px-4 text-sm cursor-pointer hover:bg-orange-50 `}
            key={size}
            // onClick={() => setSelectedSize(size)}
          >
            {size}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductCustomizeButton
