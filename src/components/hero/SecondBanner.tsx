"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

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

interface SecondBannerProps {
  banners: Banner[];
}

const SecondBanner = ({ banners }: SecondBannerProps) => {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col sm:flex-row gap-4 py-6 overflow-x-hidden">
      {banners.slice(0, 2).map((banner) => (
        <div
          key={banner.id}
          className="flex flex-col min-w-[250px] sm:min-w-[300px] md:min-w-[400px] flex-1 cursor-pointer"
          onClick={() => banner.linkUrl && router.push(banner.linkUrl)}
        >
          {/* Category Label (optional) */}
          <span className="text-center text-xs sm:text-sm md:text-lg mt-2 mb-2 text-gray-500">
            {banner.subheading || "Featured"}
          </span>

          {/* Image */}
          <div className="relative w-full h-[22rem] md:h-[30rem] sm:aspect-[4/3]">
            <Image
              src={
                `${process.env.NEXT_PUBLIC_BACKEND_URL}${banner.imageUrl}` ||
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/banners/1753020355373-sandal.png`
              }
              alt={banner.title}
              fill
              sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
              className="object-cover"
            />
          </div>

          {/* Text BELOW image */}
          <div className="flex flex-col items-center text-center mt-4">
            <span className="text-base sm:text-lg font-bold">
              {banner.title}
            </span>
            {banner.paragraph && (
              <span className="text-xs sm:text-sm text-gray-600">
                {banner.paragraph}
              </span>
            )}
            <button className="mt-2 bg-black text-white px-5 py-1.5 text-sm rounded hover:bg-gray-800 transition">
              SHOP NOW
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecondBanner;
