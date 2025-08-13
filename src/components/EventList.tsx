'use client'

import { useState } from 'react'
import { Event } from '@/types/database'
import Link from 'next/link'

interface EventListProps {
  events: Event[]
}

const AREAS = [
  '全て',
  '北海道',
  '東北',
  '関東',
  '中部',
  '近畿',
  '中国',
  '四国',
  '九州・沖縄'
]

export default function EventList({ events }: EventListProps) {
  const [selectedArea, setSelectedArea] = useState('全て')

  // 今日以降の未来のイベントのみフィルター
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 時間を00:00:00に設定
  
  const futureEvents = events.filter(event => {
    const eventDate = new Date(event.event_date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= today
  })

  const filteredEvents = selectedArea === '全て' 
    ? futureEvents 
    : futureEvents.filter(event => event.area === selectedArea)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {AREAS.map((area) => (
          <button
            key={area}
            onClick={() => setSelectedArea(area)}
            className={`
              px-3 py-1 rounded-full text-sm transition-colors
              ${selectedArea === area
                ? 'bg-cnp-blue text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {area}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {selectedArea === '全て' 
              ? 'まだイベントが登録されていません' 
              : `${selectedArea}エリアのイベントはありません`
            }
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-cnp-blue bg-blue-50 px-2 py-1 rounded">
                      {event.area}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(event.event_date)} {formatTime(event.start_time)}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {event.name}
                  </h3>
                  <div className="text-sm text-gray-600 mb-2 space-y-1">
                    <p>👤 {event.organizer}</p>
                    <p>📍 {event.venue_name}</p>
                    {event.url && <p>🔗 <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-cnp-blue hover:underline">{event.url}</a></p>}
                    {event.end_time && <p>⏰ {formatTime(event.start_time)} - {formatTime(event.end_time)}</p>}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {event.description}
                  </p>
                </div>
                <div className="ml-4">
                  <Link
                    href={`/events/${event.id}`}
                    className="cnp-button-primary text-sm"
                  >
                    詳細
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}