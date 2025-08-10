'use client'

import { Suspense } from 'react'
import StampPageContent from '@/components/StampPageContent'

export default function StampPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-cnp-blue to-cnp-purple flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    }>
      <StampPageContent />
    </Suspense>
  )
}