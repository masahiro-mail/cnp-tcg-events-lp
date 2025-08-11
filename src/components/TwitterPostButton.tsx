'use client'

import { useSession } from 'next-auth/react'

interface TwitterPostButtonProps {
  text: string
  url?: string
  hashtags?: string[]
}

export default function TwitterPostButton({ text, url, hashtags = [] }: TwitterPostButtonProps) {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  const handlePost = () => {
    const params = new URLSearchParams()
    params.append('text', text)
    
    if (url) {
      params.append('url', url)
    }
    
    if (hashtags.length > 0) {
      params.append('hashtags', hashtags.join(','))
    }

    window.open(
      `https://twitter.com/intent/tweet?${params.toString()}`,
      '_blank',
      'width=550,height=420,resizable=yes,menubar=no,toolbar=no,location=no,status=no'
    )
  }

  return (
    <button
      onClick={handlePost}
      className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
    >
      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
      Xでポスト
    </button>
  )
}