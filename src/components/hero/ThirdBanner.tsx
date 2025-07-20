"use client";

import Image from "next/image";
import Link from "next/link";

interface Banner {
  id: string;
  title: string;
  subheading?: string;
  paragraph?: string;
  imageUrl: string;
  linkUrl: string;
  position: number;
  active: boolean;
}

interface ThirdBannerProps {
  banners: Banner[];
}

const ThirdBanner = ({ banners }: ThirdBannerProps) => {
 
  if (banners.length < 2) return null;

  const [left, right] = banners;

  return (
    <div className="flex w-full max-w-[100vw] gap-2 md:gap-5 py-2 md:py-6">
      {/* LEFT BANNER (25%) */}
      <Link
        href={left.linkUrl || "#"}
        className="relative w-[50%] md:w-[25%] aspect-[3/3] md:aspect-[7/3] cursor-pointer"
      >
        <Image
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${left.imageUrl}`}
          alt={left.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-end justify-start xl:pl-8 pb-6 text-white xl:text-xl lg:text-lg sm:text-base text-[0.8rem] pl-[0.8rem] md:pl-[0.5rem] font-bold text-center">
          {left.title}
        </div>
      </Link>

      {/* RIGHT BANNER (75%) */}
      <Link
        href={right.linkUrl || "#"}
        className="relative w-[50%] md:w-[75%] aspect-[6/3] cursor-pointer"
      >
        <Image
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${right.imageUrl}`}
          alt={right.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-end justify-start xl:pl-[10rem] lg:pl-[7rem] md:pl-[5rem] sm:pl-[3rem] pb-6 text-white xl:text-2xl lg:text-xl font-bold text-center text-[0.8rem] pl-5">
          {right.title}
        </div>
      </Link>
    </div>
  );
};

export default ThirdBanner;
