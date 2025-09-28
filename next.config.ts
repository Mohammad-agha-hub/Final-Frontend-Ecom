/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'], // Allow Cloudinary images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      }
    ],
    // Increase timeout for image optimization
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // Key configuration for timeout
    loader: 'default',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    
    // Disable image optimization during development if needed
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Increase server timeout
  serverRuntimeConfig: {
    // Increase timeout to 30 seconds
    timeout: 30000,
  },
  
  // Experimental features that might help
  experimental: {
    // This can help with image loading issues
    images: {
      allowFutureImage: true,
    },
  },
};

module.exports = nextConfig;