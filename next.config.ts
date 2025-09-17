import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '*.clackypaas.com',
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
  ]
};

export default nextConfig;
