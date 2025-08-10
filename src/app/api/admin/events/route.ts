import { NextRequest, NextResponse } from 'next/server'
import { getEvents, createEvent } from '@/lib/database'

function isAdminAuthenticated(request: NextRequest): boolean {
  const cookies = request.headers.get('cookie')
  if (!cookies) return false
  
  const adminAuth = cookies
    .split(';')
    .find(cookie => cookie.trim().startsWith('admin-auth='))
    ?.split('=')[1]
  
  return adminAuth === 'authenticated'
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const events = await getEvents()
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/admin/events - Starting request')
  
  if (!isAdminAuthenticated(request)) {
    console.log('POST /api/admin/events - Unauthorized')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('POST /api/admin/events - Parsing request body')
    const data = await request.json()
    console.log('POST /api/admin/events - Request data:', data)
    
    const requiredFields = ['name', 'event_date', 'start_time', 'area', 'prefecture', 'venue_name', 'address', 'description']
    for (const field of requiredFields) {
      if (!data[field]) {
        console.log(`POST /api/admin/events - Missing field: ${field}`)
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    console.log('POST /api/admin/events - Calling createEvent')
    const event = await createEvent(data)
    console.log('POST /api/admin/events - Event created:', event)
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/events - Error details:', error)
    console.error('POST /api/admin/events - Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}