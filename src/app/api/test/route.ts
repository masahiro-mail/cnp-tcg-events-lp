import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ 
      message: 'Test API working',
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_exists: !!process.env.DATABASE_URL
      }
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { error: 'Test API failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Test API received data:', data)
    
    return NextResponse.json({ 
      message: 'Test POST working',
      received: data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test POST API error:', error)
    return NextResponse.json(
      { error: 'Test POST API failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}