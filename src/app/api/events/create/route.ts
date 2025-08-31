import { NextResponse } from 'next/server'
import { createEvent } from '@/lib/database'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    console.log('🎯 イベント作成API開始')
    
    // セッション情報を取得
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'ログインが必要です' }, { status: 401 })
    }
    
    // リクエストボディからデータを取得
    const data = await request.json()
    console.log('📅 受信データ:', data)
    
    // 必須フィールドのバリデーション
    const requiredFields = ['name', 'event_date', 'start_time', 'organizer', 'area', 'prefecture', 'venue_name', 'address']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ success: false, error: `${field}は必須項目です` }, { status: 400 })
      }
    }
    
    // エリアのバリデーション
    if (data.area === '-') {
      return NextResponse.json({ success: false, error: 'エリアを選択してください' }, { status: 400 })
    }
    
    // created_byフィールドを追加
    const eventData = {
      ...data,
      created_by: session.user.id
    }
    
    console.log('📅 作成するイベントデータ:', eventData.name)
    
    const newEvent = await createEvent(eventData)
    
    console.log('✅ イベント作成成功:', newEvent.id)
    
    return NextResponse.json({ 
      success: true, 
      event: newEvent
    })
    
  } catch (error) {
    console.error('❌ イベント作成エラー:', error)
    return NextResponse.json(
      { success: false, error: 'イベント作成に失敗しました' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'イベント作成エンドポイント。POSTでイベントを作成します。' 
  })
}