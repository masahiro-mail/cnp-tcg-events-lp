/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['pbs.twimg.com', 'via.placeholder.com'],
    unoptimized: true,
  },
  // Next.js 13.0.7用の最小設定
  experimental: {
    appDir: true,
  },
  swcMinify: false,
  // Jest Worker エラー完全回避
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.optimization.minimize = false
      config.cache = false
      // ワーカー無効化
      config.plugins = config.plugins || []
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.JEST_WORKER_ID': JSON.stringify('main'),
        })
      )
    }
    return config
  },
}

module.exports = nextConfig