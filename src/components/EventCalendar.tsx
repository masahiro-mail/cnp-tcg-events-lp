'use client'

import { useState } from 'react'
import { Event } from '@/types/database'

interface EventCalendarProps {
  events: Event[]
  selectedDate?: string | null
  onDateSelect?: (date: string | null) => void
}

export default function EventCalendar({ events, selectedDate, onDateSelect }: EventCalendarProps) {
  const [internalSelectedDate, setInternalSelectedDate] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // カレンダーには全てのイベントを表示（過去・未来問わず）

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    
    // 今日の日付を取得
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    // Previous month's days
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: '', isCurrentMonth: false, hasEvent: false })
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const hasEvent = events.some(event => event.event_date === dateStr)
      const isToday = dateStr === todayStr
      days.push({ day: day.toString(), isCurrentMonth: true, hasEvent, date: dateStr, isToday })
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

  const handleDateClick = (date: string) => {
    const newSelectedDate = selectedDate === date ? null : date
    if (onDateSelect) {
      onDateSelect(newSelectedDate)
    } else {
      setInternalSelectedDate(newSelectedDate || '')
    }
  }

  const currentSelectedDate = selectedDate || internalSelectedDate
  const days = getDaysInMonth(currentMonth)
  const selectedEvents = currentSelectedDate ? getEventsForDate(currentSelectedDate) : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="flex items-center justify-center w-10 h-10 bg-cnp-blue text-white hover:bg-blue-700 rounded-full transition-colors shadow-lg"
          aria-label="前の月"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-base sm:text-lg font-semibold px-2 sm:px-4 text-center flex-1">
          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="flex items-center justify-center w-10 h-10 bg-cnp-blue text-white hover:bg-blue-700 rounded-full transition-colors shadow-lg"
          aria-label="次の月"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
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
            onClick={() => day.date && handleDateClick(day.date)}
            className={`
              p-2 text-sm rounded-lg transition-colors relative
              ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
              ${day.isToday ? 'border-2 border-red-500 font-bold' : ''}
              ${currentSelectedDate === day.date ? 'bg-cnp-blue text-white' : ''}
              ${!currentSelectedDate && !day.isToday ? 'hover:bg-gray-100' : ''}
            `}
            disabled={!day.isCurrentMonth}
          >
            {day.day}
            {day.hasEvent && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </button>
        ))}
      </div>

    </div>
  )
}