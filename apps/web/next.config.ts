import type { NextConfig } from 'next';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@billit/api', '@billit/store', '@billit/validators'],
  agentRules: false,
} as NextConfig;

export default nextConfig;
