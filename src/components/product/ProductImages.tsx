"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  images: { url: string; id: string }[];
}

const ProductImages = ({ images }: Props) => {
  const [index, setIndex] = useState(0);
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const imageUrl = images[index]?.url;
  const fullImageUrl = `${baseUrl}${imageUrl}`;
  const thumbRef = useRef<HTMLDivElement>(null);

  if (!Array.isArray(images) || images.length === 0) {
    return <div className="text-center text-red-500">No Images Available!</div>;
  }

  const prevImage = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbClick = (i: number) => {
    setIndex(i);
    const container = thumbRef.current;
    const thumb = container?.children[i] as HTMLDivElement;
    thumb?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  return (
    <div>
      {/* Main Image Display */}
      <div className="relative flex justify-center items-center">
        <button
          onClick={prevImage}
          className="absolute left-3 z-10 bg-white rounded-full p-1 shadow lg:hidden"
        >
          <ChevronLeft size={28} />
        </button>

        <motion.div
          key={images[index].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-[660px] md:w-[800px] aspect-[4/5]"
        >
          <Image
            src={fullImageUrl}
            alt={`Product image ${index + 1}`}
            fill
            sizes="(max-width: 768px) 90vw, 800px"
            priority={index === 0}
            className="object-contain rounded-md"
          />
        </motion.div>

        <button
          onClick={nextImage}
          className="absolute right-3 z-10 bg-white rounded-full p-1 shadow lg:hidden"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Thumbnails for lg+ only */}
      <div className="hidden lg:flex justify-center mt-4 lg:ml-[5%] mb-5">
        <div
          className="flex overflow-x-hidden gap-4"
          ref={thumbRef}
        >
          {images.map((img, i) => (
            <div
              key={img.id}
              onClick={() => handleThumbClick(i)}
              className={`min-w-[80px] h-[120px] rounded-md cursor-pointer relative transition-all
              }`}
            >
              <Image
                src={`${baseUrl}${img.url}`}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductImages;
