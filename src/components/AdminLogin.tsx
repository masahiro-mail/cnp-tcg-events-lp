'use client'

import { useState } from 'react'

interface AdminLoginProps {
  onLogin: (password: string) => Promise<{ success: boolean; error?: string }>
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await onLogin(password)
    
    if (!result.success) {
      setError(result.error || 'ログインに失敗しました')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="cnp-card max-w-md w-full mx-4 p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-cnp-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">管理者ページ</h1>
          <p className="text-gray-600">パスワードを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cnp-blue focus:border-transparent"
              placeholder="管理者パスワードを入力"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="cnp-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ログイン中...
              </div>
            ) : (
              'ログイン'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← ホームに戻る
          </a>
        </div>
      </div>
    </div>
  )
}