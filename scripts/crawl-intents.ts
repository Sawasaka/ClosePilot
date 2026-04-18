/**
 * 日次クローラー：求人ボックスから採用インテントを収集して CompanyMaster に紐付ける。
 *
 * 実行:
 *   pnpm crawl:intents                          # デフォルト（IT部門）
 *   pnpm crawl:intents --department=SALES       # 部門指定
 *   pnpm crawl:intents --limit-keywords=1       # 軽量テスト
 *
 * GitHub Actions から呼ぶ想定（DATABASE_URL が設定されていれば動く）。
 */

import { PrismaClient, DepartmentType, IntentSignalType, IntentLevel } from '@prisma/client'
import { crawlKyujinbox, JobResult } from './crawlers/kyujinbox'
import { normalizeName } from './crawlers/normalize'

const prisma = new PrismaClient({ log: ['error'] })

// 部門ごとの検索キーワード定義
const KEYWORDS_BY_DEPARTMENT: Record<string, string[]> = {
  IT: ['社内SE', '情報システム 求人', '情シス 求人'],
  SALES: ['営業 求人', 'インサイドセールス 求人', '法人営業 求人'],
  MARKETING: ['マーケティング 求人', 'デジタルマーケ 求人', 'マーケター 求人'],
  HR: ['人事 求人', '採用 求人', '人事労務 求人'],
  ENGINEERING: ['エンジニア 求人', 'ソフトウェアエンジニア 求人', 'バックエンド 求人'],
}

function parseArgs() {
  const args = process.argv.slice(2)
  const department = (args.find((a) => a.startsWith('--department='))?.split('=')[1] ?? 'IT').toUpperCase() as DepartmentType
  const limitKwArg = args.find((a) => a.startsWith('--limit-keywords='))
  const limitKw = limitKwArg ? parseInt(limitKwArg.split('=')[1], 10) : null
  const maxPagesArg = args.find((a) => a.startsWith('--max-pages='))
  const maxPages = maxPagesArg ? parseInt(maxPagesArg.split('=')[1], 10) : 10
  return { department, limitKw, maxPages }
}

type MasterRow = { id: string; name: string }

async function loadCompanyMasters(): Promise<MasterRow[]> {
  return prisma.companyMaster.findMany({ select: { id: true, name: true } })
}

function buildMatcher(masters: MasterRow[]) {
  const map = new Map<string, MasterRow[]>()
  for (const m of masters) {
    const norm = normalizeName(m.name)
    if (!map.has(norm)) map.set(norm, [])
    map.get(norm)!.push(m)
  }

  return (jobCompanyName: string): MasterRow | null => {
    const jobNorm = normalizeName(jobCompanyName)
    if (!jobNorm || jobNorm.length < 2) return null
    const exact = map.get(jobNorm)
    if (exact && exact.length > 0) return exact[0]
    for (const [norm, rows] of map) {
      if (norm.length < 2) continue
      if (jobNorm.includes(norm) || norm.includes(jobNorm)) return rows[0]
    }
    return null
  }
}

function determineIntentLevel(postedDate: Date | null): IntentLevel {
  if (!postedDate) return IntentLevel.LOW
  const diffDays = (Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays <= 7) return IntentLevel.HOT
  if (diffDays <= 30) return IntentLevel.MIDDLE
  if (diffDays <= 90) return IntentLevel.LOW
  return IntentLevel.NONE
}

const levelPriority: Record<IntentLevel, number> = {
  HOT: 3,
  MIDDLE: 2,
  LOW: 1,
  NONE: 0,
}

async function main() {
  const { department, limitKw, maxPages } = parseArgs()
  console.log('=== 日次インテントクロール ===')
  console.log(`部門: ${department}`)

  const kwList = KEYWORDS_BY_DEPARTMENT[department]
  if (!kwList) throw new Error(`未対応の部門: ${department}`)
  const keywords = limitKw ? kwList.slice(0, limitKw) : kwList

  // 1) 企業マスター読み込み
  const masters = await loadCompanyMasters()
  console.log(`📚 マスター: ${masters.length}社ロード`)

  // 2) クロール実行
  const allJobs = await crawlKyujinbox({ keywords, maxPages })

  // 3) マッチング
  const match = buildMatcher(masters)
  const byMaster = new Map<string, { master: MasterRow; jobs: JobResult[] }>()
  let unmatched = 0
  for (const job of allJobs) {
    const m = match(job.company)
    if (m) {
      if (!byMaster.has(m.id)) byMaster.set(m.id, { master: m, jobs: [] })
      byMaster.get(m.id)!.jobs.push(job)
    } else {
      unmatched++
    }
  }
  console.log(`\n🔗 マッチ: ${byMaster.size}社 / 未マッチ: ${unmatched}件`)

  // 4) DB反映
  console.log('\n💾 DB反映中...')
  let totalNewSignals = 0
  const dist = { HOT: 0, MIDDLE: 0, LOW: 0, NONE: 0 }

  for (const [masterId, { master, jobs }] of byMaster) {
    let bestLevel: IntentLevel = IntentLevel.NONE
    let latestDate: Date | null = null
    let insertedCount = 0

    for (const job of jobs) {
      const level = determineIntentLevel(job.postedDate)
      if (levelPriority[level] > levelPriority[bestLevel]) bestLevel = level
      if (job.postedDate && (!latestDate || job.postedDate > latestDate)) latestDate = job.postedDate

      const stableUrl = `kyujinbox://${normalizeName(job.company)}/${normalizeName(job.title)}`
      try {
        await prisma.intentSignal.create({
          data: {
            companyMasterId: masterId,
            departmentType: department,
            signalType: IntentSignalType.JOB_POSTING,
            source: job.sourceName,
            sourceUrl: stableUrl,
            title: job.title,
            publishedAt: job.postedDate,
            rawData: {
              originalUrl: job.url,
              location: job.location,
              crawledAt: new Date().toISOString(),
            },
          },
        })
        insertedCount++
      } catch {
        // 重複キー等はスキップ
      }
    }

    totalNewSignals += insertedCount

    // CompanyIntent を upsert
    await prisma.companyIntent.upsert({
      where: {
        companyMasterId_departmentType: { companyMasterId: masterId, departmentType: department },
      },
      update: {
        intentLevel: bestLevel,
        signalCount: jobs.length,
        latestSignalAt: latestDate,
      },
      create: {
        companyMasterId: masterId,
        departmentType: department,
        intentLevel: bestLevel,
        signalCount: jobs.length,
        latestSignalAt: latestDate,
      },
    })

    dist[bestLevel]++
    console.log(`  [${bestLevel.padEnd(6)}] ${master.name}: ${jobs.length}件（新規${insertedCount}）`)
  }

  // 5) lastCrawledAt を更新
  await prisma.companyMaster.updateMany({
    where: { id: { in: Array.from(byMaster.keys()) } },
    data: { lastCrawledAt: new Date() },
  })

  console.log('\n=== 完了 ===')
  console.log(`新規シグナル: ${totalNewSignals}件`)
  console.log('インテント分布:')
  console.log(`  HOT:    ${dist.HOT}社`)
  console.log(`  MIDDLE: ${dist.MIDDLE}社`)
  console.log(`  LOW:    ${dist.LOW}社`)
  console.log(`  NONE:   ${dist.NONE}社`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('❌ エラー:', e)
  await prisma.$disconnect()
  process.exit(1)
})
