import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@bgm/db'

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
        corporateNumber: true,
        name: true,
        nameKana: true,
        websiteUrl: true,
        prefecture: true,
        city: true,
        address: true,
        corporateType: true,
        employeeCount: true,
        revenue: true,
        representative: true,
        representativePhone: true,
        representativeEmail: true,
        serviceSummary: true,
        enrichmentStatus: true,
        lastCrawledAt: true,
        lastEnrichedAt: true,
        industry: { select: { id: true, name: true } },
        serviceTags: { select: { tag: { select: { id: true, name: true } } } },
        _count: { select: { offices: true, departments: true, intentSignals: true } },
      },
    }),
    prisma.companyMaster.count({ where }),
    // 求人インテント: 部門別集計を全件取得（フロントで部門切替用）
    prisma.companyIntent.findMany({
      where: { intentLevel: { in: ['HOT', 'MIDDLE', 'LOW'] } },
      select: {
        companyMasterId: true,
        departmentType: true,
        intentLevel: true,
        latestSignalAt: true,
        signalCount: true,
      },
      orderBy: { latestSignalAt: 'desc' },
    }),
  ])

  // companyId → 部門別インテント配列
  const intentMap = new Map<
    string,
    Array<{
      departmentType: string
      intentLevel: string
      latestSignalAt: Date | null
      signalCount: number
    }>
  >()
  for (const i of intents) {
    const arr = intentMap.get(i.companyMasterId) ?? []
    arr.push({
      departmentType: i.departmentType,
      intentLevel: i.intentLevel,
      latestSignalAt: i.latestSignalAt,
      signalCount: i.signalCount,
    })
    intentMap.set(i.companyMasterId, arr)
  }

  const rowsWithIntent = rows.map((r) => ({
    ...r,
    companyIntents: intentMap.get(r.id) ?? [],
  }))

  // 各企業の最高インテントで並び替え（HOT→MIDDLE→LOW→NONE、同列は企業名順）
  const data = rowsWithIntent.sort((a, b) => {
    const aTop = a.companyIntents.reduce(
      (max, ci) => Math.max(max, INTENT_PRIORITY[ci.intentLevel] ?? 0),
      0,
    )
    const bTop = b.companyIntents.reduce(
      (max, ci) => Math.max(max, INTENT_PRIORITY[ci.intentLevel] ?? 0),
      0,
    )
    if (aTop !== bTop) return bTop - aTop
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
