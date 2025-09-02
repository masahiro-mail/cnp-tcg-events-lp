import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // /eventsの場合は、UUIDでない場合は通常のeventsページへ
  if (pathname.startsWith('/events/') && pathname !== '/events') {
    const id = pathname.replace('/events/', '')
    console.log('🔍 Middleware: Checking route for ID:', id)
    
    // UUIDの形式をチェック
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    
    if (!uuidRegex.test(id)) {
      console.log('❌ Middleware: Invalid UUID, redirecting to events list')
      // UUIDでない場合は、/eventsページにリダイレクト
      return NextResponse.redirect(new URL('/events', request.url))
    }
    
    console.log('✅ Middleware: Valid UUID, proceeding to event detail')
  }
  
  return NextResponse.next()
}

// /events/[id] パスのみでミドルウェアを実行
export const config = {
  matcher: '/events/:path*'
}