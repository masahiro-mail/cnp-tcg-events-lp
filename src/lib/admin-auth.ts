import bcrypt from 'bcryptjs'

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
    if (!adminPasswordHash) {
      console.error('ADMIN_PASSWORD_HASH environment variable not set')
      return false
    }
    
    return await bcrypt.compare(password, adminPasswordHash)
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