'use client'

import { signIn, getSession, getProviders } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [providers, setProviders] = useState<Record<string, any> | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push('/')
      }
    })
    
    getProviders().then((providers) => {
      setProviders(providers)
    })
  }, [router])

  const handleSignIn = async () => {
    if (!termsAccepted || !privacyAccepted) {
      alert('利用規約とプライバシーポリシーに同意してください')
      return
    }

    try {
      setIsLoading(true)
      await signIn('twitter', { 
        callbackUrl: '/',
        redirect: true
      })
    } catch (error) {
      console.error('SignIn error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="cnp-card max-w-md w-full mx-4 p-8 text-center">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">CNPトレカ交流会</h1>
          <p className="text-gray-600">Xアカウントでログインしてください</p>
        </div>

        <div className="mb-6 text-left space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">ログインする前に</h3>
          <p className="text-sm text-gray-600 mb-4">
            サービスをご利用いただく前に、以下の内容をご確認いただき、同意をお願いいたします。
          </p>
          
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-cnp-blue focus:ring-cnp-blue border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                <Link href="/terms" target="_blank" className="text-cnp-blue hover:underline">
                  利用規約
                </Link>
                に同意します
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-cnp-blue focus:ring-cnp-blue border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                <Link href="/privacy" target="_blank" className="text-cnp-blue hover:underline">
                  プライバシーポリシー
                </Link>
                に同意します
              </span>
            </label>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600">
              ログインにより以下の情報を取得します：Xユーザー名、アイコン、ユーザーID
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignIn}
          disabled={isLoading || !termsAccepted || !privacyAccepted}
          className="cnp-button-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>Xでログイン</span>
            </>
          )}
        </button>
        
        {providers && !providers.twitter && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              💡 開発環境ではデモ用認証が有効です
            </p>
          </div>
        )}
      </div>
    </div>
  )
}