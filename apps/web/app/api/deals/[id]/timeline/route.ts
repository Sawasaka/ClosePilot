import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@bgm/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = (session as unknown as { userId?: string })?.userId
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id: dealId } = await ctx.params

  const [emails, meetings, transcripts] = await Promise.all([
    prisma.emailMessage.findMany({
      where: { dealId },
      orderBy: { sentAt: 'desc' },
      take: 50,
      select: {
        id: true,
        subject: true,
        snippet: true,
        fromAddress: true,
        fromName: true,
        toAddresses: true,
        sentAt: true,
        direction: true,
      },
    }),
    prisma.meetingEvent.findMany({
      where: { dealId },
      orderBy: { startsAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        startsAt: true,
        endsAt: true,
        meetUrl: true,
        status: true,
        occurrenceIndex: true,
        meetingType: true,
        attendeeEmails: true,
      },
    }),
    prisma.transcript.findMany({
      where: { dealId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        source: true,
        fullText: true,
        durationSec: true,
        googleDocUrl: true,
        meetingEventId: true,
        createdAt: true,
      },
    }),
  ])

  return NextResponse.json({
    emails,
    meetings,
    transcripts: transcripts.map((t) => ({
      ...t,
      // 一覧では先頭600字まで
      preview: t.fullText.slice(0, 600),
      fullText: undefined,
    })),
  })
}
