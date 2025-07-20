"use client";

import { useRouter } from "next/navigation";
import { ArrowDown } from "lucide-react";
import Image from "next/image";

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

interface FirstBannerProps {
  banner?: Banner;
}

const FirstBanner = ({ banner }: FirstBannerProps) => {
  const router = useRouter();

  if (!banner) return null;

  return (
    <div className="relative w-full overflow-hidden">
      <div className="w-full h-[85vh] md:h-[90vh] lg:h-[95vh] relative aspect-[16/9] md:aspect-[16/8] lg:aspect-[16/7]">
        <Image
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${banner.imageUrl}`}
          alt={banner.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 bg-black/40">
          {banner.subheading && (
            <p className="text-base md:text-lg lg:text-xl mb-4">
              {banner.subheading}
            </p>
          )}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2">
            {banner.title}
          </h1>
          {banner.paragraph && (
            <p className="text-sm md:text-base lg:text-lg max-w-xl mb-6">
              {banner.paragraph}
            </p>
          )}

          {banner.linkUrl && (
            <button
              onClick={() => router.push(banner.linkUrl)}
              className="bg-white mt-2 text-black cursor-pointer px-6 py-3 rounded-md hover:bg-gray-200 transition"
            >
              Shop Now
            </button>
          )}
          <ArrowDown className="mt-5 bounce-arrow" size={35} />
        </div>
      </div>
    </div>
  );
};

export default FirstBanner;
