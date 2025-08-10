'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Participant {
  id: string
  user_x_id: string
  user_x_name: string
  user_x_icon_url: string
  created_at: string
}

interface EventParticipantsProps {
  eventId: string
  initialParticipants: Participant[]
}

export default function EventParticipants({ eventId, initialParticipants }: EventParticipantsProps) {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants)
  const [loading, setLoading] = useState(false)

  const refreshParticipants = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/participants`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(data)
      }
    } catch (error) {
      console.error('Error refreshing participants:', error)
    } finally {
      setLoading(false)
    }
  }

  // グローバルイベントで参加者リストの更新を監視
  useEffect(() => {
    const handleParticipationChange = () => {
      refreshParticipants()
    }

    window.addEventListener('participationChanged', handleParticipationChange)
    
    return () => {
      window.removeEventListener('participationChanged', handleParticipationChange)
    }
  }, [])

  // 参加者数（開催者1名 + 参加者数）
  const totalParticipants = participants.length + 1

  return (
    <div className="space-y-6">
      {/* 参加者数表示 */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">参加者数</h3>
        <p className="text-3xl font-bold text-cnp-blue">
          {loading ? (
            <span className="animate-pulse">...</span>
          ) : (
            totalParticipants
          )}
          <span className="text-lg text-gray-500 ml-1">人</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          開催者1名 + 参加者{participants.length}名
        </p>
      </div>

      {/* 参加メンバー */}
      <div className="cnp-card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          参加メンバー ({totalParticipants}人)
        </h2>
        
        {/* 開催者表示 */}
        <div className="mb-4 p-3 bg-cnp-yellow bg-opacity-20 border border-cnp-yellow rounded-lg">
          <div className="flex items-center space-x-3">
            <Image
              src="https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=CNP"
              alt="CNP運営チーム"
              width={40}
              height={40}
              className="rounded-full border-2 border-cnp-yellow"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">CNP運営チーム</p>
              <p className="text-xs text-gray-500">イベントを主催しています</p>
            </div>
            <div className="bg-cnp-yellow text-cnp-yellow bg-opacity-30 px-2 py-1 rounded-full text-xs font-medium">
              主催者
            </div>
          </div>
        </div>

        {participants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            まだ参加者がいません
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <Image
                  src={participant.user_x_icon_url}
                  alt={participant.user_x_name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {participant.user_x_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(participant.created_at).toLocaleDateString('ja-JP')} 参加
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}