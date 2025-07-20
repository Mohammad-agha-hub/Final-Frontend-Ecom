import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['ecom-project-production.up.railway.app'],  // Add the domain here
    remotePatterns: [
      {
        protocol: "https",  // Ensure it's using https if your site is served over https
        hostname: "ecom-project-production.up.railway.app",
        pathname: "/uploads/productImages/**"  // Specify the path to your images
      },
      {
        protocol: "https",
        hostname: "ecom-project-production.up.railway.app", // Add production URL
        pathname: "/uploads/banners/**", // Path for banner images
      },
    ]
  }
};

export default nextConfig;
