import { Suspense } from 'react'
import Header from '@/components/Header'
import EventCalendar from '@/components/EventCalendar'
import EventList from '@/components/EventList'
import TwitterPostButton from '@/components/TwitterPostButton'
import { getEvents } from '@/lib/database'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const events = await getEvents()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CNPトレカ交流会
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            全国のCNPトレーディングカード交流会情報をお届け。
          </p>
          <div className="flex justify-center">
            <TwitterPostButton 
              text="今後のCNPトレカ交流会、イベントの情報はこちら！みんなでCNPトレカで交流しましょう🔥 #CNP #CNPトレカ #交流会"
              url="https://www.event.cnp-traingcard.com"
              hashtags={[]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="cnp-card p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📅 イベントカレンダー</h2>
            <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
              <EventCalendar events={events} />
            </Suspense>
          </div>

          <div className="cnp-card p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🗾 全国エリア別スケジュール</h2>
            <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
              <EventList events={events} />
            </Suspense>
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