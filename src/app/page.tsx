'use client'

import { useState, useEffect, Suspense } from 'react'
import Header from '@/components/Header'
import EventCalendar from '@/components/EventCalendar'
import EventList from '@/components/EventList'
import TwitterPostButton from '@/components/TwitterPostButton'
import { Event } from '@/types/database'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Add cache busting and no-cache headers
        const timestamp = Date.now()
        const response = await fetch(`/api/events?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        const data = await response.json()
        console.log('Fetched events:', data.length, 'events')
        setEvents(data)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CNPトレカ イベントページ
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            全世界のCNPトレカのイベント情報をまとめています
          </p>
          <div className="flex justify-center">
            <TwitterPostButton 
              text="今後のCNPトレカイベントの情報はこちら！みんなでCNPトレカで交流しましょう🔥 #CNP #CNPトレカ #イベント"
              url="https://cnp-tcg-events-lp-production.up.railway.app"
              hashtags={[]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="cnp-card p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📅 イベントカレンダー</h2>
            {loading ? (
              <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
            ) : (
              <EventCalendar 
                events={events} 
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            )}
          </div>

          <div className="cnp-card p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🗾 全国エリア別スケジュール</h2>
            {loading ? (
              <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
            ) : (
              <EventList 
                events={events} 
                selectedDate={selectedDate}
                onDateClear={() => setSelectedDate(null)}
              />
            )}
          </div>
        </div>

      </div>
      
      {/* フッター - クレジット */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Created by 図解師★ウルフ
          </p>
        </div>
      </footer>
    </div>
  )
}