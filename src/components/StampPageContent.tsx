'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'

interface Event {
  id: string
  name: string
  event_date: string
  start_time: string
  venue_name: string
  area: string
  prefecture: string
}

export default function StampPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [stampStatus, setStampStatus] = useState<'idle' | 'getting' | 'success' | 'duplicate' | 'error'>('idle')

  const eventId = searchParams.get('event_id')

  useEffect(() => {
    if (!eventId) {
      router.push('/')
      return
    }

    // イベント詳細を取得
    fetch(`/api/events/${eventId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('Event not found:', data.error)
          router.push('/')
          return
        }
        setEvent(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to fetch event:', error)
        router.push('/')
      })
  }, [eventId, router])

  const handleGetStamp = async () => {
    if (!session || !eventId) {
      signIn('twitter')
      return
    }

    setStampStatus('getting')

    try {
      const response = await fetch('/api/stamp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: eventId,
          user_x_id: session.user.id,
          user_x_name: session.user.name,
          user_x_icon_url: session.user.image,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setStampStatus('success')
      } else if (result.error === 'DUPLICATE_PARTICIPATION') {
        setStampStatus('duplicate')
      } else {
        setStampStatus('error')
      }
    } catch (error) {
      console.error('Stamp error:', error)
      setStampStatus('error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cnp-blue to-cnp-purple flex items-center justify-center">
        <div className="text-white text-xl">イベント情報を読み込み中...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cnp-blue to-cnp-purple flex items-center justify-center">
        <div className="text-white text-xl">イベントが見つかりませんでした</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cnp-blue to-cnp-purple p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* イベント情報 */}
        <div className="bg-gradient-to-r from-cnp-orange to-cnp-yellow p-6">
          <h1 className="text-2xl font-bold text-white mb-2">{event.name}</h1>
          <div className="text-white/90 space-y-1">
            <div className="flex items-center">
              <span className="text-lg">📅 {event.event_date}</span>
              <span className="ml-2 text-lg">⏰ {event.start_time}</span>
            </div>
            <div className="flex items-center">
              <span className="text-lg">📍 {event.venue_name}</span>
            </div>
            <div className="text-sm">
              {event.prefecture} {event.area}
            </div>
          </div>
        </div>

        {/* スタンプ獲得セクション */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              CNPトレカ交流会スタンプ
            </h2>
            <p className="text-gray-600">
              Xでログインして参加スタンプを獲得しよう！
            </p>
          </div>

          {/* 状態別の表示 */}
          {stampStatus === 'idle' && (
            <button
              onClick={handleGetStamp}
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-cnp-blue to-cnp-purple text-white font-bold py-4 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {status === 'loading' ? '読み込み中...' : session ? 'スタンプを獲得' : 'Xでログインしてスタンプ獲得'}
            </button>
          )}

          {stampStatus === 'getting' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cnp-blue mx-auto mb-4"></div>
              <p className="text-gray-600">スタンプを獲得中...</p>
            </div>
          )}

          {stampStatus === 'success' && (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">
                スタンプ獲得成功！
              </h3>
              <p className="text-gray-600 mb-4">
                CNPトレカ交流会への参加が記録されました
              </p>
              <button
                onClick={() => router.push('/mypage')}
                className="bg-cnp-blue text-white px-6 py-2 rounded-lg hover:bg-cnp-blue/90 transition-colors"
              >
                マイページで確認
              </button>
            </div>
          )}

          {stampStatus === 'duplicate' && (
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-orange-600 mb-2">
                すでに獲得済み
              </h3>
              <p className="text-gray-600 mb-4">
                このイベントのスタンプは既に獲得しています
              </p>
              <button
                onClick={() => router.push('/mypage')}
                className="bg-cnp-orange text-white px-6 py-2 rounded-lg hover:bg-cnp-orange/90 transition-colors"
              >
                マイページで確認
              </button>
            </div>
          )}

          {stampStatus === 'error' && (
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-bold text-red-600 mb-2">
                エラーが発生しました
              </h3>
              <p className="text-gray-600 mb-4">
                スタンプの獲得に失敗しました。もう一度お試しください。
              </p>
              <button
                onClick={() => setStampStatus('idle')}
                className="bg-cnp-blue text-white px-6 py-2 rounded-lg hover:bg-cnp-blue/90 transition-colors"
              >
                もう一度試す
              </button>
            </div>
          )}
        </div>

        {/* 戻るボタン */}
        <div className="px-6 pb-6">
          <button
            onClick={() => router.push('/')}
            className="w-full text-gray-600 hover:text-cnp-blue transition-colors py-2"
          >
            ← ホームに戻る
          </button>
        </div>
      </div>
    </div>
  )
}