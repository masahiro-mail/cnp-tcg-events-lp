import { NextResponse } from 'next/server'
import { createEvent } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    console.log('🎯 イベント作成API開始')
    
    // ユーザー認証チェック（Xでログインしているかチェック）
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ログインが必要です' },
        { status: 401 }
      )
    }
    
    // リクエストボディからイベントデータを取得
    const body = await request.json()
    const eventData = {
      ...body,
      created_by: user.id // 作成者IDを設定
    }
    
    console.log('📅 イベントデータ:', eventData.name, 'by', user.name)
    
    const newEvent = await createEvent(eventData)
    
    console.log('✅ イベント作成成功:', newEvent.id)
    
    return NextResponse.json({ 
      success: true, 
      event: newEvent,
      message: 'イベントが作成されました'
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