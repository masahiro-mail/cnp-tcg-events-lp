'use client'

import { useState } from 'react'
import { Event } from '@/types/database'

interface EventCalendarProps {
  events: Event[]
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    
    // Previous month's days
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: '', isCurrentMonth: false, hasEvent: false })
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const hasEvent = events.some(event => event.event_date === dateStr)
      days.push({ day: day.toString(), isCurrentMonth: true, hasEvent, date: dateStr })
    }
    
    return days
  }

  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.event_date === date)
  }

  const days = getDaysInMonth(currentMonth)
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ←
        </button>
        <h3 className="text-lg font-semibold">
          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <div key={day} className="p-2 font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day.date && setSelectedDate(day.date)}
            className={`
              p-2 text-sm rounded-lg transition-colors relative
              ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
              ${day.hasEvent ? 'bg-cnp-blue text-white font-medium' : 'hover:bg-gray-100'}
              ${selectedDate === day.date ? 'ring-2 ring-cnp-orange' : ''}
            `}
            disabled={!day.isCurrentMonth}
          >
            {day.day}
            {day.hasEvent && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-cnp-orange rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      {selectedDate && selectedEvents.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            {selectedDate} のイベント
          </h4>
          <div className="space-y-2">
            {selectedEvents.map((event) => (
              <div key={event.id} className="text-sm">
                <div className="font-medium text-cnp-blue">{event.name}</div>
                <div className="text-gray-600">
                  {event.start_time} - {event.venue_name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}