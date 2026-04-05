import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disable external directory scanning for better performance
  experimental: {
    optimizePackageImports: ['@iconify/react'],
  },
  // Optimize production build
  compress: true,
  // Performance: disable x-powered-by header
  poweredByHeader: false,
}

export default nextConfig
