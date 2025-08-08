import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    const hash = await hashPassword(password)
    
    return NextResponse.json({ 
      hash,
      message: 'Copy this hash and set it as ADMIN_PASSWORD_HASH environment variable in Railway'
    })
  } catch (error) {
    console.error('Password hashing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}