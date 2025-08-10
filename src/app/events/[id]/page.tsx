import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import ParticipateButton from '@/components/ParticipateButton'
import EventParticipants from '@/components/EventParticipants'
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

              <div className="space-y-4 mb-8">
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
            <div className="mt-6">
              <ParticipateButton eventId={params.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}