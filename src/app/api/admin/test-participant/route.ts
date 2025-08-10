import { NextRequest, NextResponse } from 'next/server'
import { createParticipant } from '@/lib/database'

function isAdminAuthenticated(request: NextRequest): boolean {
  const cookies = request.headers.get('cookie')
  if (!cookies) return false
  
  const adminAuth = cookies
    .split(';')
    .find(cookie => cookie.trim().startsWith('admin-auth='))
    ?.split('=')[1]
  
  return adminAuth === 'authenticated'
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { event_id, user_x_name, user_x_username } = await request.json()
    
    if (!event_id || !user_x_name || !user_x_username) {
      return NextResponse.json(
        { error: 'event_id, user_x_name, user_x_username are required' },
        { status: 400 }
      )
    }

    const participant = await createParticipant({
      event_id,
      user_x_id: `test-${user_x_username}-${Date.now()}`,
      user_x_name,
      user_x_icon_url: `https://via.placeholder.com/48x48/4F46E5/white?text=${user_x_name.charAt(0)}`
    })

    if (participant) {
      return NextResponse.json(participant, { status: 201 })
    } else {
      return NextResponse.json(
        { error: 'Already participated or failed to create participant' },
        { status: 409 }
      )
    }
  } catch (error) {
    console.error('Error creating test participant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}