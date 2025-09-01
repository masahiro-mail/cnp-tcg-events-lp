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
  console.log('🔧 PUT /api/events/[id] - Start, ID:', params.id)
  
  try {
    console.log('🔧 Getting current user...')
    const user = await getCurrentUser()
    console.log('🔧 Current user:', user ? `${user.name} (${user.id})` : 'null')
    
    if (!user) {
      console.log('❌ Unauthorized - no user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔧 Getting event by ID:', params.id)
    const event = await getEventById(params.id)
    console.log('🔧 Found event:', event ? `${event.name} (created by: ${event.created_by})` : 'null')
    
    if (!event) {
      console.log('❌ Event not found')
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // イベントの作成者かどうかチェック
    console.log('🔧 Checking ownership - event.created_by:', event.created_by, 'user.id:', user.id)
    if (event.created_by !== user.id) {
      console.log('❌ Forbidden - user is not the creator')
      return NextResponse.json({ error: 'Forbidden: You can only edit your own events' }, { status: 403 })
    }

    console.log('🔧 Parsing request data...')
    const data = await request.json()
    console.log('🔧 Request data:', data)
    
    // 必須フィールドのバリデーション（end_timeは任意）
    const requiredFields = ['name', 'event_date', 'start_time', 'organizer', 'area', 'prefecture', 'venue_name', 'address']
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // area が '-' の場合はエラー
    if (data.area === '-') {
      return NextResponse.json(
        { error: 'Please select a valid area' },
        { status: 400 }
      )
    }

    console.log('🔧 Updating event in database...')
    const updatedEvent = await updateEvent(params.id, data)
    console.log('🔧 Updated event result:', updatedEvent ? 'Success' : 'Failed')
    
    if (!updatedEvent) {
      console.log('❌ Database update failed')
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    console.log('✅ Event updated successfully')
    return NextResponse.json({ success: true, event: updatedEvent })
  } catch (error) {
    console.error('❌ Error in PUT /api/events/[id]:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await getEventById(params.id)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // イベントの作成者かどうかチェック
    if (event.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own events' }, { status: 403 })
    }

    const success = await deleteEvent(params.id)
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}