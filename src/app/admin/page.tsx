'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    // Diagram_Wolfユーザーのみ許可
    const username = (session.user as any)?.username
    if (username === 'Diagram_Wolf') {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
      router.push('/')
    }
  }, [session, status, router])

  const handleLogout = () => {
    router.push('/')
  }

  if (status === 'loading' || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cnp-blue"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="cnp-card p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            アクセス権限がありません
          </h1>
          <p className="text-gray-600 mb-6">
            この機能はDiagram_Wolfユーザーのみ利用可能です
          </p>
          <button
            onClick={() => router.push('/')}
            className="cnp-button-primary"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  return <AdminDashboard onLogout={handleLogout} />
}