'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-cnp-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">CNP</span>
            </div>
            <span className="font-bold text-xl text-gray-900">トレカイベント</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-cnp-blue transition-colors">
              ホーム
            </Link>
            <a 
              href="https://www.cnp-tradingcard.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-cnp-blue transition-colors"
            >
              CNPトレカファンサイト
            </a>
            {session && (
              <Link href="/mypage" className="text-gray-600 hover:text-cnp-blue transition-colors">
                マイページ
              </Link>
            )}
            {session && session.user?.username === 'Diagram_Wolf' && (
              <Link href="/admin" className="text-gray-600 hover:text-cnp-blue transition-colors">
                管理者ページ
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {/* モバイル用マイページリンク */}
            {session && (
              <Link href="/mypage" className="md:hidden text-gray-600 hover:text-cnp-blue transition-colors">
                <div className="flex flex-col items-center text-xs">
                  <span>📝</span>
                  <span>マイページ</span>
                </div>
              </Link>
            )}
            
            {status === 'loading' ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cnp-blue"></div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {session.user?.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="cnp-button-primary text-sm"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}