/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Railway build時のTypeScriptエラーを無視（本番環境では注意が必要）
    ignoreBuildErrors: false,
  },
  eslint: {
    // Railway build時のESLintエラーを無視（本番環境では注意が必要）
    ignoreDuringBuilds: false,
  },
  // 静的エクスポート設定（必要に応じて）
  images: {
    unoptimized: true,
  },
  // 実験的機能を削除してビルドを安定化
}

module.exports = nextConfig