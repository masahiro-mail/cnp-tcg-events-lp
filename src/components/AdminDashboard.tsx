'use client'

import { useState, useEffect } from 'react'
import { Event, CreateEventData } from '@/types/database'
import EventForm from './EventForm'

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (data: CreateEventData) => {
    console.log('handleCreateEvent called with data:', data)
    try {
      console.log('Making API request to /api/admin/events')
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        console.log('Response OK, fetching events')
        await fetchEvents()
        setShowForm(false)
        return { success: true }
      } else {
        const errorText = await response.text()
        console.error('Response not OK. Status:', response.status, 'Error:', errorText)
        return { success: false, error: `イベントの作成に失敗しました: ${errorText}` }
      }
    } catch (error) {
      console.error('Network error:', error)
      return { success: false, error: `ネットワークエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  }

  const handleUpdateEvent = async (id: string, data: CreateEventData) => {
    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        await fetchEvents()
        setEditingEvent(null)
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'イベントの更新に失敗しました' }
      }
    } catch (error) {
      return { success: false, error: 'ネットワークエラーが発生しました' }
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('このイベントを削除しますか？関連する参加者データも削除されます。')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchEvents()
      } else {
        alert('イベントの削除に失敗しました')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('ネットワークエラーが発生しました')
    }
  }

  const copyStampUrl = (eventId: string) => {
    const url = `${window.location.origin}/stamp?event_id=${eventId}`
    navigator.clipboard.writeText(url).then(() => {
      alert('スタンプ用URLをコピーしました！')
    }).catch(() => {
      alert('URLのコピーに失敗しました')
    })
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cnp-blue"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">管理者ダッシュボード</h1>
            <button
              onClick={onLogout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 管理メニュー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="cnp-card p-4 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">イベント管理</h3>
            <p className="text-sm text-gray-600 mb-3">現在の表示中イベント</p>
            <p className="text-2xl font-bold text-cnp-blue">{events.length}</p>
          </div>
          
          <div className="cnp-card p-4 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">ユーザー管理</h3>
            <p className="text-sm text-gray-600 mb-3">登録ユーザーの確認</p>
            <button
              onClick={() => window.open('/admin/users', '_blank')}
              className="cnp-button-secondary text-sm w-full"
            >
              ユーザー一覧
            </button>
          </div>
          
          <div className="cnp-card p-4 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">イベント履歴</h3>
            <p className="text-sm text-gray-600 mb-3">永続化されたデータ</p>
            <button
              onClick={() => window.open('/admin/events/masters', '_blank')}
              className="cnp-button-secondary text-sm w-full"
            >
              マスター一覧
            </button>
          </div>
          
          <div className="cnp-card p-4 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">新規作成</h3>
            <p className="text-sm text-gray-600 mb-3">イベントの追加</p>
            <button
              onClick={() => setShowForm(true)}
              className="cnp-button-primary text-sm w-full"
            >
              イベント作成
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">現在のイベント一覧</h2>
            <p className="text-gray-600">表示中のイベント（編集・削除可能）</p>
          </div>
          <div className="flex space-x-3">
            <a
              href="/admin/events/create"
              className="cnp-button-primary"
            >
              新しいイベントを作成
            </a>
            <button
              onClick={() => setShowForm(true)}
              className="cnp-button-secondary"
            >
              クイック作成
            </button>
            <a
              href="/admin/test-participants"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              テスト参加者追加
            </a>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="cnp-card p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              まだイベントがありません
            </h3>
            <p className="text-gray-600 mb-6">
              最初のイベントを作成しましょう
            </p>
            <div className="flex space-x-3 justify-center">
              <a
                href="/admin/events/create"
                className="cnp-button-primary"
              >
                イベントを作成
              </a>
              <button
                onClick={() => setShowForm(true)}
                className="cnp-button-secondary"
              >
                クイック作成
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {events.map((event) => (
              <div key={event.id} className="cnp-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-cnp-blue text-white px-2 py-1 rounded text-sm font-medium">
                        {event.area}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(event.event_date)} {formatTime(event.start_time)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {event.name}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>👤 {event.organizer}</p>
                      <p>📍 {event.venue_name}</p>
                      <p>🗾 {event.prefecture}</p>
                      {event.url && <p>🔗 <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-cnp-blue hover:underline">{event.url}</a></p>}
                      {event.end_time && <p>⏰ {formatTime(event.start_time)} - {formatTime(event.end_time)}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => copyStampUrl(event.id)}
                      className="cnp-button-secondary text-sm"
                      title="スタンプ用URLをコピー"
                    >
                      📱 URL
                    </button>
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
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

      {showForm && (
        <EventForm
          onSubmit={handleCreateEvent}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingEvent && (
        <EventForm
          initialData={editingEvent}
          onSubmit={(data) => handleUpdateEvent(editingEvent.id, data)}
          onCancel={() => setEditingEvent(null)}
        />
      )}
    </div>
  )
}