import { NextResponse } from 'next/server'
import { createEvent } from '@/lib/database'

export async function POST(request: Request) {
  try {
    console.log('🎯 イベント作成API開始')
    
    // 8/16イベントデータを直接作成
    const eventData = {
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
      announcement_url: 'https://example.com/event'
    }
    
    console.log('📅 イベントデータ:', eventData.name)
    
    const newEvent = await createEvent(eventData)
    
    console.log('✅ イベント作成成功:', newEvent.id)
    
    return NextResponse.json({ 
      success: true, 
      event: newEvent,
      message: '8/16イベントが作成されました'
    })
    
  } catch (error) {
    console.error('❌ イベント作成エラー:', error)
    return NextResponse.json(
      { success: false, error: 'イベント作成に失敗しました', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'イベント作成エンドポイント。POSTでイベントを作成します。' 
  })
}