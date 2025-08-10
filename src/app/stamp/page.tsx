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

export default function StampPage() {
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

    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      if (response.ok) {
        const eventData = await response.json()
        setEvent(eventData)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleGetStamp = async () => {
    if (!session || !event) {
      await signIn('twitter', { 
        callbackUrl: `/stamp?event_id=${eventId}` 
      })
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
          event_id: event.id,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        if (result.success) {
          setStampStatus('success')
        } else if (result.error === 'already_participated') {
          setStampStatus('duplicate')
        } else {
          setStampStatus('error')
        }
      } else {
        setStampStatus('error')
      }
    } catch (error) {
      console.error('Error getting stamp:', error)
      setStampStatus('error')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cnp-blue to-cnp-purple flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cnp-blue to-cnp-purple flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">イベントが見つかりません</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-white text-cnp-blue px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cnp-blue to-cnp-purple">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="cnp-card max-w-md w-full p-8 text-center">
            {/* スタンプ機能一時停止メッセージ */}
            <div className="mb-6">
              <div className="text-6xl mb-4">🚧</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                スタンプ機能は一時停止中です
              </h1>
              <p className="text-gray-600 mb-4">
                現在、システムメンテナンスのため<br />
                スタンプ機能を一時停止しております。
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-yellow-800 mb-2">📋 イベント情報</h3>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p><strong>{event.name}</strong></p>
                  <p>📅 {formatDate(event.event_date)} {formatTime(event.start_time)}</p>
                  <p>📍 {event.venue_name}</p>
                  <p>🗾 {event.prefecture}</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => router.push('/')}
                  className="cnp-button-primary w-full"
                >
                  ホームに戻る
                </button>
              </div>
            </div>
            
            {false && stampStatus === 'idle' && (
              <>
                <div className="mb-6">
                  <div className="text-6xl mb-4">🎯</div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    スタンプ獲得
                  </h1>
                  <p className="text-gray-600">
                    イベント参加の記念スタンプを獲得しよう！
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-cnp-blue text-white px-2 py-1 rounded text-xs font-medium">
                      {event.area}
                    </span>
                    <span className="text-sm text-gray-500">
                      {event.prefecture}
                    </span>
                  </div>
                  <h2 className="font-bold text-gray-900 mb-2">{event.name}</h2>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📅 {formatDate(event.event_date)} {formatTime(event.start_time)}</p>
                    <p>📍 {event.venue_name}</p>
                  </div>
                </div>

                <button
                  onClick={handleGetStamp}
                  className="cnp-button-primary w-full flex items-center justify-center space-x-2"
                >
                  {!session ? (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>Xで認証してスタンプをGET！</span>
                    </>
                  ) : (
                    <>
                      <span>🎯</span>
                      <span>スタンプを獲得する</span>
                    </>
                  )}
                </button>

                {session && (
                  <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <img
                      src={session.user?.image || ''}
                      alt="Profile"
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{session.user?.name} としてログイン中</span>
                  </div>
                )}
              </>
            )}

            {stampStatus === 'getting' && (
              <>
                <div className="text-6xl mb-4">⏳</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  スタンプを獲得中...
                </h2>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cnp-blue mx-auto"></div>
              </>
            )}

            {stampStatus === 'success' && (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-xl font-bold text-green-600 mb-2">
                  スタンプを獲得しました！
                </h2>
                <p className="text-gray-600 mb-6">
                  イベント参加ありがとうございました！<br />
                  マイページで確認できます。
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/mypage')}
                    className="cnp-button-primary w-full"
                  >
                    マイページを見る
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="cnp-button-secondary w-full"
                  >
                    ホームに戻る
                  </button>
                </div>
              </>
            )}

            {stampStatus === 'duplicate' && (
              <>
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-cnp-orange mb-2">
                  このイベントのスタンプは獲得済みです
                </h2>
                <p className="text-gray-600 mb-6">
                  このイベントには既に参加済みです。<br />
                  マイページで履歴を確認できます。
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/mypage')}
                    className="cnp-button-primary w-full"
                  >
                    マイページを見る
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="cnp-button-secondary w-full"
                  >
                    ホームに戻る
                  </button>
                </div>
              </>
            )}

            {stampStatus === 'error' && (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-xl font-bold text-red-600 mb-2">
                  エラーが発生しました
                </h2>
                <p className="text-gray-600 mb-6">
                  スタンプの獲得に失敗しました。<br />
                  しばらく時間をおいて再度お試しください。
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setStampStatus('idle')}
                    className="cnp-button-primary w-full"
                  >
                    再試行
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="cnp-button-secondary w-full"
                  >
                    ホームに戻る
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
    </div>
  )
}