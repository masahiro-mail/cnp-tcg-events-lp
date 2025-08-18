import { NextResponse } from 'next/server'
import { getEvents } from '@/lib/database'

export const dynamic = 'force-dynamic'

// フォールバック用の8/16イベントデータ
const fallbackEvents = [
  {
    id: 'event-osaka-championship-20250816',
    name: 'チャンピオンシップ決勝戦PublicView@大阪＆大阪定例交流会#003',
    event_date: '2025-08-16',
    start_time: '11:30:00',
    end_time: '18:00:00',
    organizer: '図解師★ウルフ',
    area: '近畿',
    prefecture: '大阪府',
    venue_name: 'TIME SHARING TSHG淀屋橋ビル 2F Room.2',
    address: '大阪市中央区今橋２丁目６−１４ 関西ペイントビル',
    url: 'https://time-sharing.jp/detail/666798',
    description: 'モニターで決勝戦の様子を見ながらみんなで盛り上がりたいと思っています🎉\n交流会も兼ねているので、トレカを持参頂きバトルもやりましょう⚔️\n（私は第二弾のプロキシカードを持っていく予定😆）\n入退出自由、短時間でも参加OK🌈\n来れそうな方はリプくださいませ😊',
    announcement_url: 'https://example.com/event',
    created_at: new Date().toISOString()
  }
]

export async function GET() {
  try {
    console.log('🔍 本番環境イベント取得開始')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
    const events = await getEvents()
    console.log(`📊 取得したイベント数: ${events.length}`)
    console.log('取得したイベント:', events.map(e => ({ id: e.id, name: e.name })))
    
    // イベントが空の場合、フォールバックデータを返す
    if (!events || events.length === 0) {
      console.log('⚠️ イベントが空のため、フォールバックデータを返します')
      return NextResponse.json(fallbackEvents)
    }
    
    return NextResponse.json(events)
  } catch (error) {
    console.error('❌ イベント取得エラー:', error)
    console.log('🔄 フォールバックデータを返します')
    return NextResponse.json(fallbackEvents)
  }
}