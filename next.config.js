/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  turbopack: {
    root: __dirname,
  },

  env: {
    AGENT_RUNTIME_URL: process.env.AGENT_RUNTIME_URL || 'http://localhost:8080',
  },

  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;