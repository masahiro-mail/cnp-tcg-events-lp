'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface EventMaster {
  id: string
  name: string
  event_date: string
  start_time: string
  area: string
  prefecture: string
  venue_name: string
  address: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AdminEventMastersPage() {
  const [events, setEvents] = useState<EventMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchEventMasters()
  }, [])

  const fetchEventMasters = async () => {
    try {
      const response = await fetch('/api/admin/event-masters')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin')
          return
        }
        throw new Error('イベントマスター一覧の取得に失敗しました')
      }
      const data = await response.json()
      setEvents(data.events)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    if (!confirm(`「${eventName}」を削除してもよろしいですか？この操作は取り消せません。`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/event-masters/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        if (response.status === 401) {
          alert('権限がありません')
          return
        }
        throw new Error('イベントの削除に失敗しました')
      }

      // 成功したらリストから削除
      setEvents(events.filter(event => event.id !== eventId))
      alert('イベントを削除しました')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'エラーが発生しました')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">イベントマスター管理</h1>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              管理画面へ戻る
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-600">
                登録イベント数: <span className="font-semibold">{events.length}</span>件
              </p>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ 削除したイベントマスターは復元できません
              </p>
            </div>
            
            {events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">まだイベントが登録されていません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className={`border rounded-lg p-4 ${
                    event.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {event.name}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {event.is_active ? 'アクティブ' : '非アクティブ'}
                          </span>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">開催日:</span> {formatDate(event.event_date)}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">開始時間:</span> {formatTime(event.start_time)}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">地域:</span> {event.area} - {event.prefecture}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">会場:</span> {event.venue_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">住所:</span> {event.address}
                            </p>
                          </div>
                        </div>
                        
                        {event.description && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">説明:</span>
                            </p>
                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                              {event.description}
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-3 text-xs text-gray-500">
                          作成: {formatDate(event.created_at)} | 
                          更新: {formatDate(event.updated_at)}
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col space-y-2">
                        <button
                          onClick={() => handleDeleteEvent(event.id, event.name)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
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
    </div>
  )
}