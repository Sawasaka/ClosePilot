import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@closepilot/db'

export const dynamic = 'force-dynamic'

const INTENT_PRIORITY: Record<string, number> = { HOT: 4, MIDDLE: 3, LOW: 2, NONE: 1 }

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const search = sp.get('search') ?? undefined
  const intentLevel = sp.get('intentLevel') ?? undefined
  const industryId = sp.get('industryId') ?? undefined
  const take = Math.min(parseInt(sp.get('take') ?? '5000', 10), 10000)
  const skip = parseInt(sp.get('skip') ?? '0', 10)

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { corporateNumber: { contains: search } },
    ]
  }
  if (industryId) where.industryId = industryId
  if (intentLevel) {
    where.companyIntents = {
      some: { intentLevel: intentLevel as 'HOT' | 'MIDDLE' | 'LOW' | 'NONE' },
    }
  }

  const [rows, total, intents] = await Promise.all([
    prisma.companyMaster.findMany({
      where,
      take,
      skip,
      select: {
        id: true,
        name: true,
        websiteUrl: true,
        industry: { select: { name: true } },
      },
    }),
    prisma.companyMaster.count({ where }),
    // インテントデータは別クエリで取得して軽量化
    prisma.companyIntent.findMany({
      where: { intentLevel: { in: ['HOT', 'MIDDLE', 'LOW'] } },
      select: { companyMasterId: true, intentLevel: true, latestSignalAt: true },
      orderBy: { latestSignalAt: 'desc' },
    }),
  ])

  // インテントを企業IDでマップ化（TOP1のみ保持）
  const intentMap = new Map<
    string,
    { intentLevel: string; latestSignalAt: Date | null }
  >()
  for (const i of intents) {
    // orderBy latestSignalAt desc なので、先にセットされた方がTOP
    if (!intentMap.has(i.companyMasterId)) {
      intentMap.set(i.companyMasterId, {
        intentLevel: i.intentLevel,
        latestSignalAt: i.latestSignalAt,
      })
    }
  }

  const rowsWithIntent = rows.map((r) => {
    const top = intentMap.get(r.id)
    return {
      ...r,
      companyIntents: top ? [top] : [],
    }
  })

  // インテント優先度順に並び替え（HOT→MIDDLE→LOW→NONE、同列は企業名順）
  const data = rowsWithIntent.sort((a, b) => {
    const aTop = a.companyIntents[0]?.intentLevel
    const bTop = b.companyIntents[0]?.intentLevel
    const aPri = aTop ? (INTENT_PRIORITY[aTop] ?? 0) : 0
    const bPri = bTop ? (INTENT_PRIORITY[bTop] ?? 0) : 0
    if (aPri !== bPri) return bPri - aPri
    return a.name.localeCompare(b.name, 'ja')
  })

  return NextResponse.json(
    { data, total, take, skip },
    {
      headers: {
        // ブラウザは60秒キャッシュ、バックでは5分まで古い内容を配信しつつ再検証
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    },
  )
}
