import { NextRequest, NextResponse } from 'next/server'
import { getParticipantsByEventId } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    const participants = await getParticipantsByEventId(eventId)
    
    return NextResponse.json(participants)
  } catch (error) {
    console.error('Participants API error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}