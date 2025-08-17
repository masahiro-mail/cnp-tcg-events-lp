'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ParticipateButtonProps {
  eventId: string
  onParticipationChange?: () => void
}

export default function ParticipateButton({ eventId, onParticipationChange }: ParticipateButtonProps) {
  const { data: session, status } = useSession()
  const [isJoined, setIsJoined] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [checking, setChecking] = useState<boolean>(true)

  // 参加状態をチェック
  useEffect(() => {
    if (session?.user) {
      checkParticipationStatus()
    } else {
      setChecking(false)
    }
  }, [session, eventId])

  const checkParticipationStatus = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/participate`)
      if (response.ok) {
        const data = await response.json()
        setIsJoined(data.isJoined)
      }
    } catch (error) {
      console.error('Error checking participation status:', error)
    } finally {
      setChecking(false)
    }
  }

  const handleParticipate = async (action: 'join' | 'leave') => {
    if (!session?.user || loading) return

    console.log(`🚀 [FRONTEND] 参加処理開始 - Action: ${action}, Event: ${eventId}, User: ${session.user.name}`)
    
    setLoading(true)
    try {
      const requestBody = { action }
      console.log(`📤 [FRONTEND] APIリクエスト送信:`)
      console.log(JSON.stringify(requestBody, null, 2))
      
      const response = await fetch(`/api/events/${eventId}/participate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log(`📥 [FRONTEND] APIレスポンス - Status: ${response.status}, OK: ${response.ok}`)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ [FRONTEND] APIレスポンス成功:`)
        console.log(JSON.stringify(data, null, 2))
        
        setIsJoined(action === 'join')
        if (onParticipationChange) {
          onParticipationChange()
        }
        // グローバルイベントを発火して参加者リストを更新
        window.dispatchEvent(new Event('participationChanged'))
        // 成功メッセージを表示（オプション）
        console.log(`🎉 [FRONTEND] ${data.message}`)
      } else {
        const error = await response.json()
        console.error(`❌ [FRONTEND] APIエラー:`, error)
        alert(error.error)
      }
    } catch (error) {
      console.error(`💥 [FRONTEND] 通信エラー:`, error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // ログインしていない場合
  if (status === 'loading' || checking) {
    return (
      <div className="cnp-card p-6 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="cnp-card p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          このイベントに参加予定ですか？
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          参加するにはログインが必要です
        </p>
        <button
          onClick={() => window.location.href = '/auth/signin'}
          className="w-full bg-cnp-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Xでログインして参加する
        </button>
      </div>
    )
  }

  return (
    <div className="cnp-card p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        このイベントに参加予定ですか？
      </h3>
      {isJoined ? (
        <>
          <p className="text-green-600 mb-4 text-sm font-medium">
            ✅ 参加予定です
          </p>
          <button
            onClick={() => handleParticipate('leave')}
            disabled={loading}
            className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'キャンセル中...' : 'キャンセルする'}
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-600 mb-4 text-sm">
            会場でお待ちしています！
          </p>
          <button
            onClick={() => handleParticipate('join')}
            disabled={loading}
            className="w-full bg-cnp-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? '参加登録中...' : 'このイベントに参加する'}
          </button>
        </>
      )}
    </div>
  )
}