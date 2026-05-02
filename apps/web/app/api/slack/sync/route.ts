import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'
import { syncSlackForOrg } from '@/lib/slack/sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Slack の手動同期。
 * POST /api/slack/sync?workspaceId=...   省略時は org の全 workspace を同期
 */
export async function POST(req: Request) {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 })

  const url = new URL(req.url)
  const workspaceId = url.searchParams.get('workspaceId')

  try {
    if (workspaceId) {
      const result = await syncSlackForOrg(workspaceId)
      return NextResponse.json({ ok: true, results: [{ workspaceId, ...result }] })
    }
    const workspaces = await prisma.slackWorkspace.findMany({
      where: { orgId: user.orgId, enabled: true },
      select: { id: true },
    })
    const results = []
    for (const w of workspaces) {
      const r = await syncSlackForOrg(w.id)
      results.push({ workspaceId: w.id, ...r })
    }
    return NextResponse.json({ ok: true, results })
  } catch (e) {
    console.error('[slack/sync]', e)
    return NextResponse.json(
      { error: 'sync_failed', message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}
