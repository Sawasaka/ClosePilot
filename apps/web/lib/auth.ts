import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { prisma } from '@bgm/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // ID 認証だけを担う。機能スコープは /api/google/install で incremental に取得。
          scope: ['openid', 'email', 'profile'].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // 初回ログイン時に Google account を DB へ保存
      if (account && profile && account.provider === 'google') {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.googleSub = account.providerAccountId
        token.email = profile.email

        const userId = await ensureUser({
          email: profile.email as string,
          name: (profile.name as string) ?? (profile.email as string),
        })
        token.userId = userId

        if (account.refresh_token) {
          await prisma.userGoogleAccount.upsert({
            where: { userId },
            create: {
              userId,
              googleSub: account.providerAccountId,
              email: profile.email as string,
              accessToken: account.access_token ?? null,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
              scope: (account.scope as string) ?? null,
            },
            update: {
              googleSub: account.providerAccountId,
              email: profile.email as string,
              accessToken: account.access_token ?? null,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
              scope: (account.scope as string) ?? null,
            },
          })
        }
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      ;(session as unknown as { userId?: string }).userId = token.userId as string | undefined
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})

// User がなければ作成。orgId は環境変数 DEFAULT_ORG_ID か、最初の Organization を使う。
async function ensureUser({ email, name }: { email: string; name: string }): Promise<string> {
  const existing = await prisma.user.findFirst({ where: { email } })
  if (existing) return existing.id

  const orgId =
    process.env.DEFAULT_ORG_ID ??
    (await prisma.organization.findFirst({ orderBy: { createdAt: 'asc' } }))?.id

  if (!orgId) {
    // 組織がまだ無い: 自動作成
    const org = await prisma.organization.create({
      data: { name: 'Default', slug: 'default' },
    })
    const user = await prisma.user.create({
      data: { orgId: org.id, email, name, role: 'ADMIN' },
    })
    return user.id
  }

  const user = await prisma.user.create({
    data: { orgId, email, name, role: 'REP' },
  })
  return user.id
}
