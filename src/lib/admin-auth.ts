import bcrypt from 'bcryptjs'

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$example.hash.here'

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  } catch (error) {
    console.error('Admin password verification error:', error)
    return false
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export function isAdminAuthenticated(request: Request): boolean {
  const cookies = request.headers.get('cookie')
  if (!cookies) return false
  
  const adminAuth = cookies
    .split(';')
    .find(cookie => cookie.trim().startsWith('admin-auth='))
    ?.split('=')[1]
  
  return adminAuth === 'authenticated'
}