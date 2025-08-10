'use client'

import { signIn, getSession, getProviders } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [providers, setProviders] = useState<any>(null)

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push('/')
      }
    })
    
    getProviders().then((providers) => {
      console.log('Available providers:', providers)
      setProviders(providers)
    })
  }, [router])

  const handleSignIn = async () => {
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
        
        <button
          onClick={handleSignIn}
          disabled={isLoading}
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