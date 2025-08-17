import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: {
    default: 'CNPトレカイベント | 全国のCNPトレーディングカードのイベント情報',
    template: '%s | CNPトレカイベント'
  },
  description: '全国のCNPトレーディングカードのイベント情報をお届け。',
  keywords: ['CNP', 'CNPトレカ', 'トレーディングカード', '交流会', 'イベント', 'カードゲーム', 'コミュニティ'],
  authors: [{ name: 'CNPトレカイベント運営' }],
  creator: 'CNPトレカイベント運営',
  publisher: 'CNPトレカイベント運営',
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
    siteName: 'CNPトレカイベント',
    title: 'CNPトレカイベント | 全国のCNPトレーディングカードのイベント情報',
    description: '全国のCNPトレーディングカードのイベント情報をお届け。',
    images: [
      {
        url: 'https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=CNP%E3%83%88%E3%83%AC%E3%82%AB%E4%BA%A4%E6%B5%81%E4%BC%9A',
        width: 1200,
        height: 630,
        alt: 'CNPトレカ交流会 - 全国のイベント情報をお届け',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@cnp_ninjadao',
    creator: '@cnp_ninjadao',
    title: 'CNPトレカイベント | 全国のCNPトレーディングカードのイベント情報',
    description: '全国のCNPトレーディングカードのイベント情報をお届け。',
    images: ['https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=CNP%E3%83%88%E3%83%AC%E3%82%AB%E4%BA%A4%E6%B5%81%E4%BC%9A'],
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