import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"], // ✅ Allow Cloudinary-hosted images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**", // ✅ Allow all Cloudinary paths
      },
    ],
  },
};

export default nextConfig;
