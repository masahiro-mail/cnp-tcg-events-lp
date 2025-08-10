import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import { getCurrentUser } from '@/lib/auth'
import { getParticipantsByUserId, getEventById } from '@/lib/database'

export default async function MyPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  const participants = await getParticipantsByUserId(user.id)
  
  const eventsWithDetails = await Promise.all(
    participants.map(async (participant) => {
      const event = await getEventById(participant.event_id)
      return {
        participant,
        event
      }
    })
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="cnp-card p-8">
            <div className="flex items-center space-x-4 mb-6">
              <Image
                src={user.image}
                alt="プロフィール"
                width={80}
                height={80}
                className="rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">@{user.username}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-cnp-blue bg-opacity-10 rounded-lg">
                <div className="text-3xl font-bold text-cnp-blue">
                  {participants.length}
                </div>
                <div className="text-sm text-gray-600">参加イベント数</div>
              </div>
              
              <div className="text-center p-4 bg-cnp-orange bg-opacity-10 rounded-lg">
                <div className="text-3xl font-bold text-cnp-orange">
                  {new Set(participants.map(p => p.event_id.split('-')[0])).size}
                </div>
                <div className="text-sm text-gray-600">訪問エリア数</div>
              </div>
              
              <div className="text-center p-4 bg-cnp-yellow bg-opacity-10 rounded-lg">
                <div className="text-3xl font-bold text-cnp-yellow">
                  ⭐
                </div>
                <div className="text-sm text-gray-600">コレクター</div>
              </div>
            </div>
          </div>
        </div>

        <div className="cnp-card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📅 参加予定のイベント
          </h2>
          
          {eventsWithDetails.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                参加予定のイベントはありません
              </h3>
              <p className="text-gray-600 mb-6">
                イベントに参加して交流を楽しみましょう！
              </p>
              <Link
                href="/events"
                className="cnp-button-primary"
              >
                イベントを探す
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {eventsWithDetails.map(({ participant, event }) => (
                <div
                  key={participant.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-cnp-blue text-white px-2 py-1 rounded-full text-xs font-medium">
                          📅 参加予定
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(participant.created_at).toLocaleDateString('ja-JP')} 参加登録
                        </span>
                      </div>
                      
                      {event && (
                        <>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {event.name}
                          </h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>📅 {formatDate(event.event_date)} {formatTime(event.start_time)}</p>
                            <p>📍 {event.venue_name}</p>
                            <p>🗾 {event.area} - {event.prefecture}</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      {event && (
                        <Link
                          href={`/events/${event.id}`}
                          className="cnp-button-secondary text-sm"
                        >
                          詳細を見る
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}