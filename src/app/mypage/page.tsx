'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import EventForm from '@/components/EventForm'
import { Event, CreateEventData } from '@/types/database'

export const dynamic = 'force-dynamic'

export default function MyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  
  // ログインしていない場合はサインインページへ
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // 自分が作成したイベント一覧を取得
  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!session?.user?.id) return
      
      try {
        const response = await fetch('/api/events', {
          cache: 'no-store',
        })
        const allEvents = await response.json()
        
        // 自分が作成したイベントのみフィルタ
        const myEvents = allEvents.filter((event: Event) => event.created_by === session.user.id)
        setEvents(myEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchMyEvents()
    }
  }, [session])

  const handleCreateEvent = async (data: CreateEventData) => {
    try {
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setShowEventForm(false)
        // イベント一覧を再取得
        window.location.reload()
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      return { success: false, error: 'イベント作成に失敗しました' }
    }
  }

  const handleEditEvent = async (data: CreateEventData) => {
    if (!editingEvent) return { success: false, error: 'エラーが発生しました' }
    
    try {
      console.log('イベント更新リクエスト:', data)
      console.log('イベントID:', editingEvent.id)
      
      const response = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      console.log('レスポンスステータス:', response.status)
      
      const result = await response.json()
      console.log('APIレスポンス:', result)
      
      if (response.ok && result.success) {
        setEditingEvent(null)
        // イベント一覧を再取得
        window.location.reload()
        return { success: true }
      } else {
        const errorMessage = result.error || `HTTPエラー: ${response.status} ${response.statusText}`
        console.error('イベント更新エラー:', errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error('ネットワークエラー:', error)
      return { success: false, error: `ネットワークエラー: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('このイベントを削除しますか？')) return
    
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        // イベント一覧を再取得
        window.location.reload()
      } else {
        alert('イベント削除に失敗しました: ' + result.error)
      }
    } catch (error) {
      alert('イベント削除に失敗しました')
    }
  }

  // ログイン状態をチェック中
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cnp-blue"></div>
      </div>
    )
  }

  // ログインしていない場合
  if (!session) {
    return null // リダイレクト中
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="cnp-card p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={session.user.image || '/default-avatar.png'}
              alt="プロフィール"
              className="w-16 h-16 rounded-full border-2 border-cnp-blue"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session.user.name}のマイページ
              </h1>
              <p className="text-gray-600">@{session.user.username}</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowEventForm(true)}
            className="cnp-button-primary"
          >
            + イベントを作成
          </button>
        </div>

        <div className="cnp-card p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">作成したイベント</h2>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{event.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>📅 {event.event_date} {event.start_time}</p>
                        <p>📍 {event.area} / {event.venue_name}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="text-cnp-blue hover:text-blue-700 text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              まだイベントを作成していません
            </p>
          )}
        </div>
      </div>

      {/* イベント作成フォーム */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">新しいイベントを作成</h2>
                <button
                  onClick={() => setShowEventForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <EventForm
                onSubmit={handleCreateEvent}
                onCancel={() => setShowEventForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* イベント編集フォーム */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">イベントを編集</h2>
                <button
                  onClick={() => setEditingEvent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <EventForm
                initialData={editingEvent}
                onSubmit={handleEditEvent}
                onCancel={() => setEditingEvent(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}