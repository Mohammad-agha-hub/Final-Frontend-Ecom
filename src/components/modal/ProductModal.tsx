"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Product } from "../utilities/types";

// Lazy load heavy components
const ProductAdd = dynamic(() => import("./ProductAdd"), {
  ssr: false,
  loading: () => null,
});
const ProductCustomizeButton = dynamic(
  () => import("./ProductCustomizeButton"),
  { ssr: false, loading: () => null }
);

type Props = {
  open: boolean;
  onClose: () => void;
  product: Product | null;
};

const ProductModal = ({ open, onClose, product }: Props) => {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted || !open || !product) return null;

  const nextImage = () => {
    if (index < product.image.length - 1) setIndex((prev) => prev + 1);
  };

  const prevImage = () => {
    if (index > 0) setIndex((prev) => prev - 1);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-[90vw] xl:w-[75vw] lg:[70vw] md:w-[90vw] sm:w-[70vw] xl:pr-10 xl:pl-5 lg:pr-10 lg:pl-0 md:pr-8 md:pl-5 sm:pl-8 sm:pr-8 pl-6 pr-6 max-h-[95vh] rounded-xl shadow-lg relative p-4 md:py-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-1 right-1 text-gray-500 hover:text-black z-10"
          onClick={onClose}
        >
          <X size={30} className="cursor-pointer" />
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Image Section */}
          <div className="w-full md:w-1/2 flex justify-center items-center">
            <div className="relative w-full max-w-[450px] aspect-[3/4] sm:aspect-[3/4] md:h-[500px] lg:h-[600px] xl:h-[650px] flex items-center justify-center">
              {/* Left Arrow */}
              {index > 0 && (
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:scale-105 transition z-10"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              {/* Image */}
              <Image
                src={product.image[index]}
                alt="Product Image"
                fill
                className="object-contain rounded-md"
              />

              {/* Right Arrow */}
              {index < product.image.length - 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:scale-105 transition z-10"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Info Section */}
          <div className="w-full md:w-1/2 flex flex-col gap-5">
            <h1 className="text-xl font-semibold">{product.name}</h1>
            <p className="text-gray-500 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eveniet
              corporis officia...
            </p>

            <div className="h-[2px] bg-gray-100" />

            <div className="flex items-center gap-4">
              <h3 className="text-base text-gray-500 line-through">
                RS. 8,000
              </h3>
              <h2 className="font-medium text-base">{product.price}</h2>
            </div>

            <div className="h-[2px] bg-gray-100" />

            {/* Lazy components */}
            <ProductCustomizeButton product={product} />
            <ProductAdd product={product} />

            <div className="text-sm">
              <h4 className="font-medium mb-2">Details</h4>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Aspernatur quae aut officia veniam...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProductModal;
