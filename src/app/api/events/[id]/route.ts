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
      return NextResponse.json({ error: 'Forbidden: You can only edit your own events' }, { status: 403 })
    }

    const data = await request.json()
    
    const requiredFields = ['name', 'event_date', 'start_time', 'end_time', 'organizer', 'area', 'prefecture', 'venue_name', 'address']
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== '') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    const updatedEvent = await updateEvent(params.id, data)
    
    if (!updatedEvent) {
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    return NextResponse.json({ success: true, event: updatedEvent })
  } catch (error) {
    console.error('Error updating event:', error)
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