import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { joinEvent, leaveEvent, isUserJoined } from '@/lib/database'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    const user = session?.user
    
    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
    }

    const { action } = await request.json()
    const eventId = params.id
    const userId = user.id
    const userName = user.name || ''
    const userImage = user.image || ''

    if (action === 'join') {
      const success = await joinEvent(eventId, {
        user_x_id: userId,
        user_x_name: userName,
        user_x_icon_url: userImage
      })
      
      if (!success) {
        return NextResponse.json({ error: '既に参加済みです' }, { status: 400 })
      }
      
      return NextResponse.json({ success: true, message: '参加しました' })
    } else if (action === 'leave') {
      const success = await leaveEvent(eventId, userId)
      
      if (!success) {
        return NextResponse.json({ error: 'キャンセルに失敗しました' }, { status: 400 })
      }
      
      return NextResponse.json({ success: true, message: 'キャンセルしました' })
    } else {
      return NextResponse.json({ error: '不正なアクションです' }, { status: 400 })
    }
  } catch (error) {
    console.error('Participate API error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    const user = session?.user
    
    if (!user) {
      return NextResponse.json({ isJoined: false })
    }

    const eventId = params.id
    const userId = user.id
    
    const isJoined = await isUserJoined(eventId, userId)
    
    return NextResponse.json({ isJoined })
  } catch (error) {
    console.error('Participate status API error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}