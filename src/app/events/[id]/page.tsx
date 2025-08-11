import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import ParticipateButton from '@/components/ParticipateButton'
import EventParticipants from '@/components/EventParticipants'
import TwitterPostButton from '@/components/TwitterPostButton'
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
                    <h3 className="text-sm font-medium text-gray-500 mb-1">企画者</h3>
                    <p className="text-lg text-gray-900">{event.organizer}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">開催日時</h3>
                    <p className="text-lg text-gray-900">
                      {formatDate(event.event_date)} {formatTime(event.start_time)}
                      {event.end_time && ` - ${formatTime(event.end_time)}`}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">会場</h3>
                    <p className="text-lg text-gray-900">{event.venue_name}</p>
                    <p className="text-gray-600">{event.address}</p>
                  </div>
                  
                  {event.url && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">関連リンク</h3>
                      <a 
                        href={event.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-lg text-cnp-blue hover:underline"
                      >
                        {event.url}
                      </a>
                    </div>
                  )}
                  
                  {event?.announcement_url && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">告知URL</h3>
                      <a 
                        href={event.announcement_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-lg text-cnp-blue hover:underline"
                      >
                        {event.announcement_url}
                      </a>
                    </div>
                  )}
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
            <EventParticipants eventId={params.id} initialParticipants={participants} />
            <div className="mt-6 space-y-4">
              <ParticipateButton eventId={params.id} />
              <TwitterPostButton 
                text={`${event.name}開催決定🎉詳細は以下のURLよりご確認下さい😊 #CNP #CNPトレカ #交流会 #${event.area}`}
                url={`https://www.event.cnp-traingcard.com/${params.id}`}
                hashtags={[]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}