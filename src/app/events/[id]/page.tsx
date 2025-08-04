import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import { getEventById, getParticipantsByEventId } from '@/lib/database'

interface EventDetailPageProps {
  params: {
    id: string
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const event = await getEventById(params.id)
  
  if (!event) {
    notFound()
  }

  const participants = await getParticipantsByEventId(params.id)

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
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-cnp-blue hover:text-blue-700 transition-colors"
            >
              ← ホームに戻る
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="cnp-card p-8">
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-cnp-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                      {event.area}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {event.prefecture}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {event.name}
                  </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">開催日時</h3>
                      <p className="text-lg text-gray-900">
                        {formatDate(event.event_date)} {formatTime(event.start_time)}開始
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">会場</h3>
                      <p className="text-lg text-gray-900">{event.venue_name}</p>
                      <p className="text-gray-600">{event.address}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">参加者数</h3>
                    <p className="text-3xl font-bold text-cnp-blue">
                      {participants.length}
                      <span className="text-lg text-gray-500 ml-1">人</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">イベント詳細</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="cnp-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  参加メンバー ({participants.length}人)
                </h2>
                
                {participants.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    まだ参加者がいません
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <Image
                          src={participant.user_x_icon_url}
                          alt={participant.user_x_name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {participant.user_x_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(participant.created_at).toLocaleDateString('ja-JP')} 参加
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="cnp-card p-6 mt-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  このイベントに参加予定ですか？
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  会場でQRコードをスキャンして<br />
                  参加スタンプを獲得しましょう！
                </p>
                <div className="bg-cnp-yellow bg-opacity-20 border border-cnp-yellow rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    💡 スタンプは会場でのみ獲得できます
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}