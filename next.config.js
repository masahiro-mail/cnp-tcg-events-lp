/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['pbs.twimg.com'],
    unoptimized: true,
  },
  swcMinify: false,
}

module.exports = nextConfig