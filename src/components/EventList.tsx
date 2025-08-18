'use client'

import { useState } from 'react'
import { Event } from '@/types/database'
import Link from 'next/link'

interface EventListProps {
  events: Event[]
  selectedDate?: string | null
  onDateClear?: () => void
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
  '九州・沖縄',
  'その他'
]

type TimeFilter = 'future' | 'past'

export default function EventList({ events, selectedDate, onDateClear }: EventListProps) {
  const [selectedArea, setSelectedArea] = useState('全て')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('future')
  
  // Debug logging
  console.log('EventList received events:', events.length, events)

  // 日付フィルタリング
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let dateFilteredEvents = events
  
  if (selectedDate) {
    // カレンダーで特定の日付が選択されている場合
    const selectedDateObj = new Date(selectedDate)
    selectedDateObj.setHours(0, 0, 0, 0)
    dateFilteredEvents = events.filter(event => {
      const eventDate = new Date(event.event_date)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate.getTime() === selectedDateObj.getTime()
    })
  } else {
    // 今後/過去フィルター
    if (timeFilter === 'future') {
      dateFilteredEvents = events.filter(event => {
        const eventDate = new Date(event.event_date)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate >= today
      })
    } else {
      dateFilteredEvents = events.filter(event => {
        const eventDate = new Date(event.event_date)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate < today
      })
    }
  }

  // エリアフィルタリング
  const filteredEvents = selectedArea === '全て' 
    ? dateFilteredEvents 
    : dateFilteredEvents.filter(event => event.area === selectedArea)
  
  // ソート（今後: 最近→未来順、過去: 最近→昔順）
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.event_date).getTime()
    const dateB = new Date(b.event_date).getTime()
    
    if (selectedDate) {
      // 特定日付選択時は時間順
      return dateA - dateB
    } else if (timeFilter === 'future') {
      // 今後: 最近→未来順
      return dateA - dateB
    } else {
      // 過去: 最近→昔順（新しい日付が先）
      return dateB - dateA
    }
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5)
  }

  return (
    <div className="space-y-4">
      {/* 今後/過去フィルター（常に表示） */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setTimeFilter('future')
            onDateClear?.()
          }}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${timeFilter === 'future'
              ? 'bg-cnp-blue text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          今後
        </button>
        <button
          onClick={() => {
            setTimeFilter('past')
            onDateClear?.()
          }}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${timeFilter === 'past'
              ? 'bg-cnp-blue text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          過去
        </button>
      </div>
      
      {/* エリアフィルター */}
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
      
      {/* 選択中の条件表示 */}
      {(selectedDate || timeFilter !== 'future' || selectedArea !== '全て') && (
        <div className="text-sm text-gray-600 mb-2">
          表示中: 
          {selectedDate ? ` ${formatDate(selectedDate)}の` : ` ${timeFilter === 'future' ? '今後' : '過去'}の`}
          {selectedArea !== '全て' ? `${selectedArea}エリアの` : '全エリアの'}イベント
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {selectedDate ? `${formatDate(selectedDate)}にイベントはありません` :
             selectedArea === '全て' 
              ? `${timeFilter === 'future' ? '今後' : '過去'}のイベントがありません` 
              : `${selectedArea}エリアの${timeFilter === 'future' ? '今後' : '過去'}のイベントはありません`
            }
          </div>
        ) : (
          sortedEvents.map((event) => (
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