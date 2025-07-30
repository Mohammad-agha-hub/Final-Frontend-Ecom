// components/product/ProductClient.tsx
"use client";

import React from "react";
import { Product } from "@/components/utilities/types";
import ProductImages from "@/components/product/ProductImages";
import CustomizeProucts from "@/components/product/CustomizeProucts";
import Add from "@/components/product/Add";
import { useSettingsStore } from "@/utils/shippingStore";

interface Props {
  product: Product;
  wished: boolean;
}

const ProductClient = ({ product, wished }: Props) => {
  const { currency } = useSettingsStore();

  return (
    <div className="px-1 md:px-[10%] lg:px-10 xl:px-25 2xl:px-40 relative flex flex-col lg:flex-row gap-16">
      {/* Product Images */}
      <div className="w-full lg:w-1/2 lg:sticky top-18 h-max">
        <ProductImages
          images={product.images.map((img) => ({
            id: String(img.id),
            url: img.url,
          }))}
        />
      </div>

      {/* Product Info */}
      <div className="w-full sm:px-8 px-6 lg:w-1/2 flex flex-col gap-6 py-4">
        <h1 className="text-4xl font-medium">{product.name}</h1>
        <p className="text-gray-500">{product.description}</p>
        <div className="h-[2px] bg-gray-100" />

        {/* Pricing */}
        <div className="flex items-center gap-4">
          {product.discount > 0 ? (
            <>
              <h3 className="text-xl text-gray-500 line-through">
                {currency} {(+product.price).toLocaleString("en-PK")}
              </h3>
              <h2 className="font-medium text-2xl">
                {currency}{" "}
                {Math.round(
                  +product.price * (1 - product.discount / 100)
                ).toLocaleString("en-PK")}
              </h2>
            </>
          ) : (
            <h2 className="font-medium text-2xl">
              {currency} {(+product.price).toLocaleString("en-PK")}
            </h2>
          )}
        </div>

        <div className="h-[2px] bg-gray-100" />

        <CustomizeProucts wished={wished} product={product} />
        <Add product={product} />

        <div className="h-[2px] bg-gray-100" />

        {/* Extra Info */}
        <div className="text-sm space-y-6">
          <div>
            <h4 className="font-medium mb-4">Fabric & Care</h4>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Delivery & Returns</h4>
            <p>
              Free delivery over {currency} 5,000. Returns within 7 days if
              product is unused.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Size & Fit</h4>
            <p>True to size. Model is wearing Medium size.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductClient;
