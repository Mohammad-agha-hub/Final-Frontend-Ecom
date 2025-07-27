import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["final-backend-ecom-production.up.railway.app"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "final-backend-ecom-production.up.railway.app",
        pathname: "/uploads/productImages/**",
      },
      {
        protocol: "https",
        hostname: "final-backend-ecom-production.up.railway.app",
        pathname: "/uploads/banners/**",
      },
      {
        protocol: "https",
        hostname: "final-backend-ecom-production.up.railway.app",
        pathname: "/",
      },
    ],
  },
};

export default nextConfig;
