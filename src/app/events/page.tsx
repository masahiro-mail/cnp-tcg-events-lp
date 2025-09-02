import Link from 'next/link'
import Header from '@/components/Header'
import { getEvents } from '@/lib/database'

export default async function EventsPage() {
  console.log('📅 EventsPage: Loading events list page')
  const events = await getEvents()
  console.log('📅 EventsPage: Loaded', events.length, 'events')

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5)
  }

  // イベントを日付順にソート
  const sortedEvents = events.sort((a, b) => {
    const dateA = new Date(`${a.event_date}T${a.start_time}`)
    const dateB = new Date(`${b.event_date}T${b.start_time}`)
    return dateA.getTime() - dateB.getTime()
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📅 全イベント一覧
          </h1>
          <p className="text-gray-600 mb-6">
            開催予定のCNPトレカイベントをすべて確認できます
          </p>
        </div>

        {sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              現在開催予定のイベントはありません
            </h3>
            <p className="text-gray-600">
              新しいイベントが追加されるまでお待ちください
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event) => (
              <div
                key={event.id}
                className="cnp-card p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-cnp-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                      {event.area}
                    </span>
                    <span className="text-sm text-gray-500">
                      {event.prefecture}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {event.name}
                  </h3>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-4 text-center mr-2">📅</span>
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 text-center mr-2">⏰</span>
                    <span>{formatTime(event.start_time)}開始</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 text-center mr-2">📍</span>
                    <span className="truncate">{event.venue_name}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>

                <Link
                  href={`/events/${event.id}`}
                  className="block w-full text-center bg-cnp-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  詳細
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-cnp-blue hover:text-blue-700 transition-colors font-medium"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}