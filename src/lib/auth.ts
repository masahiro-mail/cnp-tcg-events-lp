import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function getSession() {
  return await getServerSession(authOptions)
}

export interface User {
  id: string
  name: string
  image: string
  username: string
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      return null
    }
    
    return {
      id: session.user.id!,
      name: session.user.name!,
      image: session.user.image!,
      username: session.user.username || '',
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function isAdminUser(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    return user?.username === 'Diagram_Wolf'
  } catch (error) {
    console.error('Error checking admin user:', error)
    return false
  }
}

// デモ用：テスト用ユーザーでログイン状態をシミュレート
export function getDemoUser(): User {
  return {
    id: '12345678',
    name: '田中太郎',
    username: 'tanaka_taro',
    image: 'https://via.placeholder.com/64x64/4F46E5/FFFFFF?text=田'
  }
}