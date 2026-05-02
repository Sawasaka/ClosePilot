import { Worker } from 'bullmq'
import { redis, JOB_NAMES } from '@bgm/queue'
import { prisma } from '@bgm/db'

// ステージ別の停滞しきい値（日数）
const STALL_THRESHOLDS: Record<string, number> = {
  NEW_LEAD: 5,
  QUALIFIED: 10,
  FIRST_MEETING: 21,
  SOLUTION_FIT: 14,
  PROPOSAL: 21,
  NEGOTIATION: 30,
  VERBAL_COMMIT: 14,
}

export const checkStalledDealsWorker = new Worker(
  'scheduled',
  async (job) => {
    if (job.name !== JOB_NAMES.CHECK_STALLED_DEALS) return

    const now = new Date()

    for (const [stage, days] of Object.entries(STALL_THRESHOLDS)) {
      const threshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

      // 停滞している案件を検出
      await prisma.deal.updateMany({
        where: {
          stage: stage as never,
          stalledAt: null,
          stageChangedAt: { lt: threshold },
          NOT: { stage: { in: ['CLOSED_WON', 'CLOSED_LOST'] } },
        },
        data: { stalledAt: now },
      })
    }

    console.log('Stalled deals check completed')
  },
  { connection: redis, concurrency: 1 }
)
