import { prisma, DealStage } from '@bgm/db'

/**
 * 議事録が取得された商談に対して、Deal のステージを自動遷移するルール。
 *
 * ルール:
 *   - n=1（初回商談）: NEW_LEAD/QUALIFIED → FIRST_MEETING
 *   - n=2: FIRST_MEETING → SOLUTION_FIT
 *   - n=3+: SOLUTION_FIT → PROPOSAL
 *   - 既に PROPOSAL 以降に進んでいる場合は変更しない
 */
export async function advanceDealOnMeetingCompleted(
  dealId: string,
  changedBy: string,
  occurrenceIndex: number,
): Promise<void> {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } })
  if (!deal) return

  const target = pickNextStage(deal.stage, occurrenceIndex)
  if (!target || target === deal.stage) return

  await prisma.$transaction([
    prisma.deal.update({
      where: { id: dealId },
      data: {
        stage: target,
        stageChangedAt: new Date(),
      },
    }),
    prisma.stageHistory.create({
      data: {
        dealId,
        fromStage: deal.stage,
        toStage: target,
        changedBy,
        reason: `Meet 議事録取得（${occurrenceIndex}回目商談）`,
      },
    }),
  ])
}

function pickNextStage(current: DealStage, n: number): DealStage | null {
  // クローズ済みなら触らない
  if (current === 'CLOSED_WON' || current === 'CLOSED_LOST') return null

  if (n === 1) {
    if (current === 'NEW_LEAD' || current === 'QUALIFIED') return 'FIRST_MEETING'
    return null
  }

  if (n === 2) {
    if (current === 'FIRST_MEETING') return 'SOLUTION_FIT'
    return null
  }

  if (n >= 3) {
    if (current === 'SOLUTION_FIT') return 'PROPOSAL'
    return null
  }

  return null
}
