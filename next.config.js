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
    workerThreads: false,
    cpus: 1,
  },
  swcMinify: false,
  // Jest Worker エラー完全回避 - 最大限の設定
  webpack: (config, { isServer, webpack }) => {
    // サーバーサイド・クライアントサイド両方でWorker問題回避
    config.optimization = config.optimization || {}
    config.optimization.minimize = false
    config.cache = false
    config.parallelism = 1
    
    // Jest Worker を完全にモック化
    config.resolve = config.resolve || {}
    config.resolve.alias = config.resolve.alias || {}
    config.resolve.alias['jest-worker'] = require('path').resolve(__dirname, 'jest-worker-mock.js')
    
    // 環境変数でWorker無効化
    config.plugins = config.plugins || []
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.JEST_WORKER_ID': JSON.stringify('main'),
        'process.env.__NEXT_DISABLE_JEST_WORKER': JSON.stringify('1'),
        'process.env.DISABLE_JEST_WORKER': JSON.stringify('true'),
      })
    )
    
    if (isServer) {
      // サーバー専用の追加設定
      config.externals = config.externals || []
      // jest-workerを外部化せず、モックを使用
    }
    
    return config
  },
}

module.exports = nextConfig