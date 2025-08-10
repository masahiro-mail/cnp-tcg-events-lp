import NextAuth, { NextAuthOptions } from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'
import { upsertUser } from '@/lib/database'

const providers = [];

// Twitter認証設定が有効な場合のみプロバイダーを追加
if (process.env.TWITTER_CLIENT_ID && 
    process.env.TWITTER_CLIENT_SECRET && 
    !process.env.TWITTER_CLIENT_ID.includes('your-twitter-client-id') &&
    !process.env.TWITTER_CLIENT_SECRET.includes('your-twitter-client-secret')) {
  providers.push(TwitterProvider({
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    version: "2.0",
  }));
}

export const authOptions: NextAuthOptions = {
  providers,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code, metadata) => {
      console.error('[NextAuth Error]', code, metadata)
    },
    warn: (code) => {
      console.warn('[NextAuth Warn]', code)
    },
    debug: (code, metadata) => {
      console.log('[NextAuth Debug]', code, metadata)
    }
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      try {
        if (account && profile) {
          token.sub = profile.data?.id || profile.id
          token.name = profile.data?.name || profile.name
          token.picture = profile.data?.profile_image_url || profile.profile_image_url
          token.username = profile.data?.username || profile.username
          
          // ユーザー情報を永続化
          try {
            await upsertUser({
              x_id: token.sub!,
              x_name: token.name!,
              x_username: token.username!,
              x_icon_url: token.picture as string
            })
            console.log('User upserted successfully:', token.sub)
          } catch (error) {
            console.error('User upsert error:', error)
          }
        }
        return token
      } catch (error) {
        console.error('JWT callback error:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.sub!
          session.user.name = token.name
          session.user.image = token.picture as string
          ;(session.user as any).username = token.username
        }
        return session
      } catch (error) {
        console.error('Session callback error:', error)
        return session
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin', // エラー時もログインページにリダイレクト
  },
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }