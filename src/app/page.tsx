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
            参加してスタンプを集めよう！
          </p>
          <div className="flex justify-center">
            <TwitterPostButton 
              text="CNPトレカ交流会で全国のイベント情報をチェック中！みんなで交流しましょう🃏"
              url={typeof window !== 'undefined' ? window.location.href : ''}
              hashtags={['CNP', 'トレーディングカード', '交流会']}
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

        <div className="text-center">
          <div className="cnp-card p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🚧 スタンプ機能（準備中）
            </h3>
            <p className="text-gray-600 mb-6">
              各イベントに参加すると記念スタンプを獲得できる機能を準備中です。
              現在はイベント参加のみご利用いただけます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/mypage"
                className="cnp-button-primary text-center"
              >
                マイページを見る
              </a>
              <a
                href="#events"
                className="cnp-button-secondary text-center"
              >
                イベント一覧
              </a>
            </div>
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