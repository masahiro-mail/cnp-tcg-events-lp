import bcrypt from 'bcryptjs'

// デフォルトパスワード "admin123" のハッシュ (本番環境では必ず変更してください)
const DEFAULT_HASH = '$2a$10$K7cVqrKzMOyU1.1FvM8Ui.Xb5qA1iVr6HJ2FGp5gE6.3L0R4D4XF2'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH

export async function verifyAdminPassword(password: string): Promise<boolean> {
  try {
    // 環境変数が設定されていない場合の警告
    if (ADMIN_PASSWORD_HASH === DEFAULT_HASH) {
      console.warn('WARNING: Using default admin password. Please set ADMIN_PASSWORD_HASH environment variable.')
    }
    
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