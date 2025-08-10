import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { getCurrentUser } from '@/lib/auth';
import { getParticipantsByUserId, getEventById } from '@/lib/database';

export default async function MyPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  const participants = await getParticipantsByUserId(user.id);
  
  const eventsWithDetails = await Promise.all(
    participants.map(async (participant) => {
      const event = await getEventById(participant.event_id);
      return {
        participant,
        event
      };
    })
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="cnp-card p-8">
            <div className="flex items-center space-x-4 mb-6">
              <Image
                src={user.image}
                alt="Profile"
                width={64}
                height={64}
                className="rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name}さんのマイページ
                </h1>
                <p className="text-gray-600">@{user.username}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">参加予定のイベント</h2>
          
          {eventsWithDetails.length === 0 ? (
            <div className="cnp-card p-8 text-center">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6" />
                </svg>
                <p className="text-lg">まだ参加予定のイベントがありません</p>
                <p className="text-sm text-gray-400 mt-2">
                  イベント一覧から興味のあるイベントを見つけて参加してみましょう！
                </p>
              </div>
              <Link
                href="/events"
                className="cnp-button-primary"
              >
                イベント一覧を見る
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsWithDetails.map(({ participant, event }) => (
                event && (
                  <Link key={participant.id} href={`/events/${event.id}`} className="block">
                    <div className="cnp-card hover:shadow-lg transition-shadow duration-200 p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="bg-cnp-blue text-white px-2 py-1 rounded-full text-xs font-medium">
                          {event.area}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {event.prefecture}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-2 text-sm line-clamp-2">
                        {event.name}
                      </h3>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6" />
                          </svg>
                          {formatDate(event.event_date)}
                        </div>
                        
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(event.start_time)}～
                        </div>
                        
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {event.venue_name}
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          {formatDate(participant.created_at)} に参加申込
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}