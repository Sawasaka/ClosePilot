import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return NextResponse.json({ connected: false })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ connected: false })

  const workspaces = await prisma.slackWorkspace.findMany({
    where: { orgId: user.orgId },
    select: {
      id: true,
      teamId: true,
      teamName: true,
      enabled: true,
      lastSyncAt: true,
    },
  })
  return NextResponse.json({
    connected: workspaces.length > 0,
    workspaces,
  })
}
