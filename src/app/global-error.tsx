'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="max-w-md mx-auto p-8">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                システムエラー
              </h1>
              <p className="text-gray-600 mb-6">
                アプリケーションでエラーが発生しました。
              </p>
              <button
                onClick={() => reset()}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                再試行
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}