/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  
  // Environment variables
  env: {
    AGENT_RUNTIME_URL: process.env.AGENT_RUNTIME_URL || 'http://localhost:8080',
  },
  
  // Image optimization
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
