import os from 'os'
import type { NextConfig } from 'next'

// Collect all non-loopback IPv4 addresses so the HMR WebSocket is allowed
// from any LAN IP — works for every developer without manual config.
const localNetworkIPs = Object.values(os.networkInterfaces())
  .flat()
  .filter((iface): iface is os.NetworkInterfaceInfo =>
    !!iface && iface.family === 'IPv4' && !iface.internal
  )
  .map((iface) => iface.address)

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Allow HMR WebSocket from any local network IP so React hydrates when
  // developers open the app via LAN address rather than localhost.
  allowedDevOrigins: localNetworkIPs,
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
