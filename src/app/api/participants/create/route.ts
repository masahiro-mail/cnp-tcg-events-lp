import { NextResponse } from 'next/server'
import { createParticipant, upsertUser } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('🙋‍♂️ 参加者作成API開始:', body)
    
    const { event_id, user_x_id, user_x_name, user_x_icon_url } = body
    
    if (!event_id || !user_x_id || !user_x_name || !user_x_icon_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // ユーザー情報を永続化
    await upsertUser({
      x_id: user_x_id,
      x_name: user_x_name,
      x_username: user_x_name, // 仮でnameを使用
      x_icon_url: user_x_icon_url
    })
    console.log('👤 ユーザー永続化完了:', user_x_id)
    
    // 参加者作成
    const participant = await createParticipant({
      event_id,
      user_x_id,
      user_x_name,
      user_x_icon_url
    })
    
    if (!participant) {
      return NextResponse.json(
        { error: '既に参加済みです' },
        { status: 409 }
      )
    }
    
    console.log('✅ 参加者作成成功:', participant.id)
    
    return NextResponse.json({ 
      success: true, 
      participant,
      message: '参加者が追加されました'
    })
    
  } catch (error) {
    console.error('❌ 参加者作成エラー:', error)
    return NextResponse.json(
      { success: false, error: '参加者作成に失敗しました', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: '参加者作成エンドポイント。POSTで参加者を作成します。' 
  })
}