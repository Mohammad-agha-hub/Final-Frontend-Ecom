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

interface FourthBannerProps {
  banners: Banner[];
}

const FourthBanner = ({ banners }: FourthBannerProps) => {
  if (banners.length < 2) return null;

  const [left, right] = banners;

  return (
    <div className="flex w-full max-w-[100vw] gap-2 md:gap-5">
      {/* LEFT IMAGE (70%) */}
      <Link
        href={left.linkUrl || "#"}
        className="relative md:w-[70%] w-[50%] aspect-[3/4] md:aspect-[6/3] cursor-pointer"
      >
        <Image
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${left.imageUrl}`}
          alt={left.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-end justify-start xl:pl-16 lg:pl-12 md:pl-8 sm:pl-4 pb-6 text-white xl:text-2xl lg:text-xl text-[0.8rem] font-bold pl-5">
          {left.title}
        </div>
      </Link>

      {/* RIGHT IMAGE (30%) */}
      <Link
        href={right.linkUrl || "#"}
        className="relative w-[50%] md:w-[30%] aspect-[3/3] md:aspect-[6/3] cursor-pointer"
      >
        <Image
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${right.imageUrl}`}
          alt={right.title}
          fill
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/30 flex items-end justify-start xl:pl-14 lg:pl-10 md:pl-7 pb-6 text-white xl:text-xl lg:text-lg md:text-base sm:text-sm font-bold pl-5 text-[0.8rem]">
          {right.title}
        </div>
      </Link>
    </div>
  );
};

export default FourthBanner;
