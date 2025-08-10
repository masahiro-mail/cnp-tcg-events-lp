import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { deleteEventMaster } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Diagram_Wolfユーザーのみアクセス許可
    if (!session?.user || session.user?.username !== 'Diagram_Wolf') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const eventId = params.id
    const success = await deleteEventMaster(eventId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'イベントが見つからないか、削除に失敗しました' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, message: 'イベントを削除しました' })
  } catch (error) {
    console.error('Delete event master error:', error)
    return NextResponse.json(
      { error: 'イベントの削除に失敗しました' },
      { status: 500 }
    )
  }
}