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
      const response = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setEditingEvent(null)
        // イベント一覧を再取得
        window.location.reload()
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      return { success: false, error: 'イベント更新に失敗しました' }
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
        alert(result.error || 'イベント削除に失敗しました')
      }
    } catch (error) {
      alert('イベント削除に失敗しました')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cnp-blue"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">マイページ</h1>
            <button
              onClick={() => setShowEventForm(true)}
              className="cnp-button-primary"
            >
              + イベントを作成
            </button>
          </div>

          <div className="cnp-card p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">プロフィール</h2>
            <div className="flex items-center space-x-4">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-gray-600">@{session.user?.username}</p>
              </div>
            </div>
          </div>

          <div className="cnp-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              作成したイベント ({events.length})
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cnp-blue"></div>
              </div>
            ) : events.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                まだイベントを作成していません
              </p>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{event.name}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>📅 {event.event_date} {event.start_time}</p>
                          <p>📍 {event.area} - {event.venue_name}</p>
                          <p>👤 {event.organizer}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* イベント作成フォーム */}
      {showEventForm && (
        <EventForm
          onSubmit={handleCreateEvent}
          onCancel={() => setShowEventForm(false)}
        />
      )}

      {/* イベント編集フォーム */}
      {editingEvent && (
        <EventForm
          event={editingEvent}
          onSubmit={handleEditEvent}
          onCancel={() => setEditingEvent(null)}
        />
      )}
    </div>
  )
}