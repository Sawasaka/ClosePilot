import { prisma, DepartmentType, IntentLevel } from '@bgm/db'

/**
 * 企業×部門のインテントレベルを集約更新する。
 * 呼び出し元：クロールjob実行後 / エンリッチ後
 * IntentLevelの判定ルール（abm-toolと同じ）:
 *   hot    = 1週間以内の求人あり
 *   middle = 1〜4週間以内の求人あり
 *   low    = 1〜3ヶ月以内の求人あり
 *   none   = 3ヶ月超 / シグナルなし
 */
export async function recomputeCompanyIntent(params: {
  companyMasterId: string
  departmentType: DepartmentType
}) {
  const { companyMasterId, departmentType } = params

  const signals = await prisma.intentSignal.findMany({
    where: { companyMasterId, departmentType },
    orderBy: { publishedAt: 'desc' },
  })

  const now = Date.now()
  const HOT = 7 * 24 * 60 * 60 * 1000
  const MIDDLE = 28 * 24 * 60 * 60 * 1000
  const LOW = 90 * 24 * 60 * 60 * 1000

  let level: IntentLevel = IntentLevel.NONE
  let latestSignalAt: Date | null = null

  for (const s of signals) {
    if (!s.publishedAt) continue
    const age = now - s.publishedAt.getTime()
    if (!latestSignalAt || s.publishedAt > latestSignalAt) latestSignalAt = s.publishedAt
    if (age <= HOT) {
      level = IntentLevel.HOT
      break
    }
    if (age <= MIDDLE && level !== IntentLevel.HOT) {
      level = IntentLevel.MIDDLE
    } else if (age <= LOW && level === IntentLevel.NONE) {
      level = IntentLevel.LOW
    }
  }

  return prisma.companyIntent.upsert({
    where: {
      companyMasterId_departmentType: { companyMasterId, departmentType },
    },
    update: {
      intentLevel: level,
      signalCount: signals.length,
      latestSignalAt,
    },
    create: {
      companyMasterId,
      departmentType,
      intentLevel: level,
      signalCount: signals.length,
      latestSignalAt,
    },
  })
}

/**
 * テナントの全Companyのうち、インテント情報を持つものを優先度順に取得する。
 * UI「今アプローチすべき企業」リストで使う。
 */
export async function listHighIntentCompanies(params: {
  orgId: string
  take?: number
}) {
  const { orgId, take = 50 } = params

  return prisma.company.findMany({
    where: {
      orgId,
      masterCompany: {
        companyIntents: {
          some: {
            intentLevel: { in: [IntentLevel.HOT, IntentLevel.MIDDLE] },
          },
        },
      },
    },
    include: {
      masterCompany: {
        include: {
          companyIntents: {
            where: { intentLevel: { in: [IntentLevel.HOT, IntentLevel.MIDDLE] } },
            orderBy: { latestSignalAt: 'desc' },
          },
        },
      },
      owner: true,
    },
    take,
    orderBy: { leadScore: 'desc' },
  })
}
