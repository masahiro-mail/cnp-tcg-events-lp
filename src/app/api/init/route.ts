import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/database'

async function initializeDatabase() {
  try {
    await initDatabase()
    return NextResponse.json({ success: true, message: 'Database initialized successfully' })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { success: false, error: 'Database initialization failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return initializeDatabase()
}

export async function POST() {
  return initializeDatabase()
}