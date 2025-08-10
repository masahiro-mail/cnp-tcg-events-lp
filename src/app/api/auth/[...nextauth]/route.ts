import NextAuth, { NextAuthOptions } from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'
import { upsertUser } from '@/lib/database'

// Twitter認証プロバイダーを設定（デモ用フォールバック付き）
const providers = [
  TwitterProvider({
    id: "twitter",
    name: "Twitter",
    clientId: process.env.TWITTER_CLIENT_ID || 'demo-client-id',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || 'demo-client-secret',
    version: "2.0",
    authorization: {
      url: "https://twitter.com/i/oauth2/authorize",
      params: {
        scope: "users.read tweet.read offline.access",
      },
    },
  })
];

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
          // Twitter API v2対応
          if (profile.data) {
            token.sub = profile.data.id
            token.name = profile.data.name
            token.picture = profile.data.profile_image_url
            token.username = profile.data.username
          } else {
            // フォールバック用
            token.sub = profile.id
            token.name = profile.name
            token.picture = profile.profile_image_url || profile.image
            token.username = profile.username || profile.screen_name
          }
          
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