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
  const session = await getSession()
  
  if (!session?.user) {
    return null
  }
  
  return {
    id: session.user.id!,
    name: session.user.name!,
    image: session.user.image!,
    username: (session.user as any).username,
  }
}