import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'CNPトレカ交流会',
  description: 'CNPトレカ交流会の情報サイト - 全国のイベント情報とスタンプ獲得',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}