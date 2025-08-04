import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createParticipant } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { event_id } = await request.json()
    
    if (!event_id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const participant = await createParticipant({
      event_id,
      user_x_id: session.user.id!,
      user_x_name: session.user.name!,
      user_x_icon_url: session.user.image!,
    })

    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'already_participated' },
        { status: 409 }
      )
    }

    return NextResponse.json({ success: true, participant })
  } catch (error) {
    console.error('Stamp creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}