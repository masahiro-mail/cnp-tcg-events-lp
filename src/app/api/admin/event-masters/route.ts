import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getAllEventMasters } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Diagram_Wolfユーザーのみアクセス許可
    if (!session?.user || session.user?.username !== 'Diagram_Wolf') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const events = await getAllEventMasters()
    
    return NextResponse.json({
      events: events,
      total: events.length
    })
  } catch (error) {
    console.error('Get event masters error:', error)
    return NextResponse.json(
      { error: 'イベントマスター一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}