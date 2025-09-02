'use client'

import Link from 'next/link'

export default function MobileFooter() {
  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around py-2">
        <Link 
          href="/" 
          className="flex flex-col items-center p-2 text-gray-600 hover:text-cnp-blue transition-colors"
        >
          <span className="text-xl mb-1">🏠</span>
          <span className="text-xs">ホーム</span>
        </Link>
        
        <a 
          href="https://www.cnp-tradingcard.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center p-2 text-gray-600 hover:text-cnp-blue transition-colors"
        >
          <span className="text-xl mb-1">🃏</span>
          <span className="text-xs">CNPトレカ</span>
        </a>
        
        <Link 
          href="/links" 
          className="flex flex-col items-center p-2 text-gray-600 hover:text-cnp-blue transition-colors"
        >
          <span className="text-xl mb-1">🔗</span>
          <span className="text-xs">公式リンク</span>
        </Link>
      </div>
    </footer>
  )
}