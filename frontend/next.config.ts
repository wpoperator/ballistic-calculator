import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone for development
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
