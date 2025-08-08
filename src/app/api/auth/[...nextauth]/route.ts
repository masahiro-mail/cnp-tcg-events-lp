import NextAuth, { NextAuthOptions } from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'

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
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.sub = profile.data?.id || profile.id
        token.name = profile.data?.name || profile.name
        token.picture = profile.data?.profile_image_url || profile.profile_image_url
        token.username = profile.data?.username || profile.username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.name = token.name
        session.user.image = token.picture as string
        ;(session.user as any).username = token.username
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }