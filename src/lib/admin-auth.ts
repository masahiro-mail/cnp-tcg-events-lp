import bcrypt from 'bcryptjs'

const ADMIN_PASSWORD = 'admin123'

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    // シンプルな文字列比較
    return password === ADMIN_PASSWORD
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