import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@nexusmind/sdk'],
  experimental: {
    optimizePackageImports: ['@mysten/dapp-kit', '@mysten/sui', 'framer-motion'],
  },
  images: {
    domains: [],
    unoptimized: false,
  },
  serverExternalPackages: [],
};

export default nextConfig;
