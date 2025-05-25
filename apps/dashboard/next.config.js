/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }
    return config
  },
}

module.exports = nextConfig
