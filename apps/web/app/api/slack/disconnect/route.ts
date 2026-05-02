import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Slack ワークスペースの切断（DBレコード削除）。
 * POST /api/slack/disconnect?workspaceId=...
 */
export async function POST(req: Request) {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })

  const url = new URL(req.url)
  const workspaceId = url.searchParams.get('workspaceId')
  if (!workspaceId) return NextResponse.json({ error: 'workspaceId_required' }, { status: 400 })

  // 同じ org のものか確認
  const ws = await prisma.slackWorkspace.findUnique({ where: { id: workspaceId } })
  if (!ws || ws.orgId !== user.orgId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  await prisma.slackWorkspace.delete({ where: { id: workspaceId } })
  return NextResponse.json({ ok: true })
}
