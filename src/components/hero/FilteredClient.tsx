// components/hero/FilteredClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import "keen-slider/keen-slider.min.css";

interface Product {
  id: string;
  name: string;
  slug: string;
  images: { url: string; id: number }[]; 
  image: string;
}


const LIMIT = 10;

export default function ClientSlider({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted,setMounted] = useState(false)

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: false,
    slides: { perView: 9, spacing: 20 },
    breakpoints: {
      "(max-width: 1597px)": { slides: { perView: 9, spacing: 20 } },
      "(max-width: 1527px)": { slides: { perView: 8, spacing: 18 } },
      "(max-width: 1380px)": { slides: { perView: 7, spacing: 18 } },
      "(max-width: 1217px)": { slides: { perView: 6, spacing: 18 } },
      "(max-width: 1024px)": { slides: { perView: 5, spacing: 17 } },
      "(max-width: 768px)": { slides: { perView: 4, spacing: 15 } },
      "(max-width: 605px)": { slides: { perView: 3, spacing: 15 } },
      "(max-width: 480px)": { slides: { perView: 3, spacing: 10 } },
      "(max-width: 450px)": { slides: { perView: 2, spacing: 10 } },
    },
    slideChanged(slider) {
      const rel = slider.track.details.rel;
      setCurrentSlide(rel);

      const total = slider.track.details.slides.length;

      let visibleSlides = 7;
      const slidesOption = slider.options.slides;

      if (
        typeof slidesOption === "object" &&
        slidesOption !== null &&
        "perView" in slidesOption
      ) {
        visibleSlides = (slidesOption.perView as number) ?? 7;
      }

      if (hasMore && rel + visibleSlides >= total - 1 && !loading) {
        fetchProducts(page + 1);
      }
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50); 

    return () => clearTimeout(timer);
  }, []);

  const fetchProducts = async (newPage: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?page=${newPage}&limit=${LIMIT}`
      );
      const data = await res.json();
      const newProducts = Array.isArray(data) ? data : data.products || [];

      if (newProducts.length < LIMIT) {
        setHasMore(false);
      }
      if(newProducts.length>0){
        setProducts((prev) => [...prev, ...newProducts]);
        setPage(newPage);
      }
    
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const scrollSlides = (direction: "left" | "right") => {
    const instance = instanceRef.current;
    if (!instance) return;
    const current = instance.track.details.rel;
    const offset = direction === "left" ? -2 : 2;
    instance.moveToIdx(current + offset);
  };
  if(!mounted) return null
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 relative min-h-[320px]">
      <div ref={sliderRef} className="keen-slider pt-4">
        {products.map((product, index) => (
          <Link
            href={`/products/${product.slug}`}
            key={`${product.id}-${index}`}
            className="keen-slider__slide flex flex-col items-center cursor-pointer shrink-0"
          >
            <div className="w-[200px] h-[260px] shrink-0 flex items-center justify-center overflow-hidden bg-white">
              
                <Image
                  src={product.image}
                  alt={product.name}
                  width={200}
                  height={260}
                  className="object-contain h-full w-full"
                  sizes="(max-width: 768px) 40vw, 200px"
                  loading="lazy"
                />
              
            </div>
            <span className="mt-2 text-sm text-center">{product.name}</span>
          </Link>
        ))}
      </div>

      <div className="flex justify-center items-center gap-7 mt-3 mb-5">
        <button
          onClick={() => scrollSlides("left")}
          disabled={currentSlide === 0}
          className={`${
            currentSlide === 0
              ? "text-gray-300 cursor-not-allowed"
              : "cursor-pointer"
          }`}
        >
          <ArrowLeft size={22} />
        </button>
        <button
          onClick={() => scrollSlides("right")}
          className="cursor-pointer"
        >
          <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
}
