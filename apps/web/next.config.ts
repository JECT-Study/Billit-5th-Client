import path from 'node:path';

import type { NextConfig } from 'next';

const apiProxyTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:8080';

const nextConfig = {
  // 컨테이너 배포용
  output: 'standalone',
  // 모노레포 루트 기준으로 의존성을 추적해야 workspace 패키지가 standalone에 들어감
  outputFileTracingRoot: path.join(import.meta.dirname, '../../'),
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@billit/api', '@billit/store', '@billit/validators'],
  agentRules: false,
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    return [
      { source: '/api/:path*', destination: `${apiProxyTarget}/api/:path*` },
    ];
  },
} as NextConfig;

export default nextConfig;
