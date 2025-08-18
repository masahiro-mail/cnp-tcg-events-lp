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
      
      {/* ご意見・ご要望セクション */}
      <section className="bg-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ご意見・ご要望をお聞かせください
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            サイトの改善や新機能のご提案など、ご意見・ご要望があれば遠慮なくDMください
          </p>
          <div className="flex justify-center">
            <a
              href="https://x.com/Diagram_Wolf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Xで連絡する
            </a>
          </div>
        </div>
      </section>
      
      {/* フッター - クレジット */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Created by 図解師★ウルフ
          </p>
        </div>
      </footer>
    </div>
  )
}