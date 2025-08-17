import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: {
    default: 'CNPトレカ イベントページ | 全世界のCNPトレカのイベント情報',
    template: '%s | CNPトレカ イベントページ'
  },
  description: '全世界のCNPトレカのイベント情報をまとめています。',
  keywords: ['CNP', 'CNPトレカ', 'トレーディングカード', '交流会', 'イベント', 'カードゲーム', 'コミュニティ'],
  authors: [{ name: 'CNPトレカ イベントページ運営' }],
  creator: 'CNPトレカ イベントページ運営',
  publisher: 'CNPトレカ イベントページ運営',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cnp-tcg-events-lp-production.up.railway.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://cnp-tcg-events-lp-production.up.railway.app',
    siteName: 'CNPトレカ イベントページ',
    title: 'CNPトレカ イベントページ | 全世界のCNPトレカのイベント情報',
    description: '全世界のCNPトレカのイベント情報をまとめています。',
    images: [
      {
        url: 'https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=CNP%E3%83%88%E3%83%AC%E3%82%AB%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88',
        width: 1200,
        height: 630,
        alt: 'CNPトレカ イベントページ - 全世界のイベント情報をまとめています',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@cnp_ninjadao',
    creator: '@cnp_ninjadao',
    title: 'CNPトレカ イベントページ | 全世界のCNPトレカのイベント情報',
    description: '全世界のCNPトレカのイベント情報をまとめています。',
    images: ['https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=CNP%E3%83%88%E3%83%AC%E3%82%AB%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
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