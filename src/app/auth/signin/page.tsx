'use client'

import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 既にログイン済みの場合はホームページにリダイレクト
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/')
      }
    }
    checkSession()

    // URLパラメータからエラーを取得
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    if (errorParam) {
      setError('認証に失敗しました。もう一度お試しください。')
      // URLからエラーパラメータを削除
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [router])

  const handleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await signIn('twitter', { 
        callbackUrl: '/',
        redirect: false 
      })
      
      if (result?.error) {
        setError('認証に失敗しました。もう一度お試しください。')
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('認証に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-cnp-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">CNP</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">トレカ交流会</span>
          </Link>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            ログイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Xアカウントでログインして、イベントに参加しましょう
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ログイン中...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Xでログイン
                </div>
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-cnp-blue hover:text-blue-700 transition-colors"
            >
              ← ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}