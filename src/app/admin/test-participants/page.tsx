'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  name: string
  event_date: string
  start_time: string
  area: string
  prefecture: string
}

export default function TestParticipantsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [participantUsername, setParticipantUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

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
    }
  }

  const addTestParticipant = async () => {
    if (!selectedEventId || !participantName || !participantUsername) {
      setMessage('すべての項目を入力してください')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/test-participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: selectedEventId,
          user_x_name: participantName,
          user_x_username: participantUsername,
        }),
      })

      if (response.ok) {
        setMessage(`✅ ${participantName} を参加者として追加しました`)
        setParticipantName('')
        setParticipantUsername('')
      } else {
        const error = await response.text()
        setMessage(`❌ エラー: ${error}`)
      }
    } catch (error) {
      console.error('Error adding participant:', error)
      setMessage('❌ ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const generateRandomParticipant = () => {
    const names = ['田中太郎', '佐藤花子', '山田次郎', '鈴木美咲', '高橋健太', '渡辺さくら', '伊藤大輔', '小林彩音']
    const usernames = ['tanaka_tcg', 'sato_cnp', 'yamada_fan', 'suzuki_play', 'takahashi_game', 'watanabe_card', 'ito_battle', 'kobayashi_cnp']
    
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomUsername = usernames[Math.floor(Math.random() * usernames.length)] + Math.floor(Math.random() * 1000)
    
    setParticipantName(randomName)
    setParticipantUsername(randomUsername)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="cnp-card p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">テスト参加者追加</h1>
              <p className="text-gray-600">
                イベントにテスト用の参加者を追加して参加者数を確認できます
              </p>
            </div>

            <div className="space-y-6">
              {/* イベント選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  イベントを選択
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cnp-blue focus:border-cnp-blue"
                >
                  <option value="">イベントを選択してください</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} ({event.event_date})
                    </option>
                  ))}
                </select>
              </div>

              {/* 参加者名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  参加者名
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cnp-blue focus:border-cnp-blue"
                  placeholder="例: 田中太郎"
                />
              </div>

              {/* ユーザー名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ユーザー名（@なし）
                </label>
                <input
                  type="text"
                  value={participantUsername}
                  onChange={(e) => setParticipantUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cnp-blue focus:border-cnp-blue"
                  placeholder="例: tanaka_tcg"
                />
              </div>

              {/* ランダム生成ボタン */}
              <button
                onClick={generateRandomParticipant}
                className="cnp-button-secondary"
              >
                🎲 ランダム参加者を生成
              </button>

              {/* メッセージ */}
              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('✅') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              {/* 追加ボタン */}
              <button
                onClick={addTestParticipant}
                disabled={isLoading}
                className="w-full cnp-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>追加中...</span>
                  </div>
                ) : (
                  '参加者を追加'
                )}
              </button>

              {/* 戻るボタン */}
              <button
                onClick={() => router.push('/admin')}
                className="w-full cnp-button-secondary"
              >
                管理画面に戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}