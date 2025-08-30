import { NextRequest, NextResponse } from 'next/server'
import { getEventById, updateEvent, deleteEvent } from '@/lib/database'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await getEventById(params.id)
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ユーザー認証チェック
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // イベントの存在と作成者チェック
    const existingEvent = await getEventById(params.id)
    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    if (existingEvent.created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: '自分が作成したイベントのみ編集できます' },
        { status: 403 }
      )
    }

    // イベントを更新
    const body = await request.json()
    const eventData = {
      ...body,
      created_by: user.id
    }

    const updatedEvent = await updateEvent(params.id, eventData)
    
    if (!updatedEvent) {
      return NextResponse.json(
        { success: false, error: 'イベントの更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: 'イベントを更新しました'
    })

  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { success: false, error: 'イベントの更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ユーザー認証チェック
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // イベントの存在と作成者チェック
    const existingEvent = await getEventById(params.id)
    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'イベントが見つかりません' },
        { status: 404 }
      )
    }

    if (existingEvent.created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: '自分が作成したイベントのみ削除できます' },
        { status: 403 }
      )
    }

    // イベントを削除
    const success = await deleteEvent(params.id)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'イベントの削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'イベントを削除しました'
    })

  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { success: false, error: 'イベントの削除に失敗しました' },
      { status: 500 }
    )
  }
}