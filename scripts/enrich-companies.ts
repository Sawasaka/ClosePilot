/**
 * 日次エンリッチメント：未エンリッチ／古い企業マスターの情報を Claude Haiku 4.5 で補完する。
 *
 * 収集対象:
 *   - 代表番号・代表メール
 *   - 事業内容サマリ
 *   - 従業員数レンジ
 *   - 所在地情報
 *
 * 使い方:
 *   pnpm enrich:companies                    # enrichment_status=PENDING を優先
 *   pnpm enrich:companies --limit=50         # 最大件数指定
 *   pnpm enrich:companies --stale-days=30    # 30日以上更新されていない企業
 *
 * 前提環境変数:
 *   DATABASE_URL          … closepilot本番DB
 *   ANTHROPIC_API_KEY     … Claude Haiku 4.5用
 *   SERPER_API_KEY        … Web検索
 *   JINA_API_KEY          … Webページ本文抽出（オプション、無料枠あり）
 */

import { PrismaClient, EnrichmentStatus } from '@prisma/client'

const prisma = new PrismaClient({ log: ['error'] })

const MODEL = 'claude-haiku-4-5-20251001'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const SERPER_API_KEY = process.env.SERPER_API_KEY

interface EnrichResult {
  websiteUrl?: string | null
  serviceSummary?: string | null
  companyFeatures?: string | null
  employeeCount?: string | null
  revenue?: string | null
  representative?: string | null
  representativePhone?: string | null
  representativeEmail?: string | null
}

function parseArgs() {
  const args = process.argv.slice(2)
  const limit = parseInt(args.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '50', 10)
  const staleDays = parseInt(args.find((a) => a.startsWith('--stale-days='))?.split('=')[1] ?? '30', 10)
  const dryRun = args.includes('--dry-run')
  return { limit, staleDays, dryRun }
}

async function serperSearch(query: string): Promise<{ title: string; link: string; snippet: string }[]> {
  if (!SERPER_API_KEY) return []
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, gl: 'jp', hl: 'ja', num: 5 }),
  })
  if (!res.ok) return []
  const json: {
    organic?: Array<{ title?: string; link?: string; snippet?: string }>
  } = await res.json()
  return (json.organic ?? []).map((r) => ({
    title: r.title ?? '',
    link: r.link ?? '',
    snippet: r.snippet ?? '',
  }))
}

async function jinaFetch(url: string): Promise<string> {
  const jina = `https://r.jina.ai/${url}`
  const res = await fetch(jina, {
    headers: process.env.JINA_API_KEY ? { Authorization: `Bearer ${process.env.JINA_API_KEY}` } : {},
  })
  if (!res.ok) return ''
  return (await res.text()).slice(0, 8000) // コンテキスト節約
}

async function callClaudeHaiku(system: string, user: string): Promise<string> {
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY が未設定')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })
  if (!res.ok) throw new Error(`Claude API error: ${res.status}`)
  const json: { content?: Array<{ text?: string }> } = await res.json()
  return json.content?.[0]?.text ?? ''
}

async function enrichOne(companyMasterId: string, companyName: string, prefecture: string): Promise<EnrichResult> {
  console.log(`  🔎 ${companyName}`)
  const searchResults = await serperSearch(`${companyName} 公式サイト`)
  const topHit = searchResults[0]

  let bodyText = ''
  if (topHit?.link) {
    bodyText = await jinaFetch(topHit.link)
  }

  const system = `あなたは企業調査の専門家です。与えられた企業名・検索結果・公式サイト本文から、以下の情報を抽出してJSONで返します。
- 必ずJSONのみを返してください（前後に説明文を付けない）
- 不明な項目は null としてください
- 電話番号・メールは、公式サイトに明示されている代表番号・代表連絡先のみ`

  const user = `企業名: ${companyName}
所在地: ${prefecture}

検索結果:
${searchResults
  .slice(0, 3)
  .map((r, i) => `${i + 1}. ${r.title}\n   ${r.link}\n   ${r.snippet}`)
  .join('\n')}

公式サイト本文（抜粋）:
${bodyText.slice(0, 4000)}

以下のJSONスキーマで返してください:
{
  "websiteUrl": string | null,
  "serviceSummary": string | null,        // 事業内容 150字以内
  "companyFeatures": string | null,       // 特徴・強み 100字以内
  "employeeCount": string | null,         // "1-10" | "11-50" | "51-200" | "201-1000" | "1000+" | null
  "revenue": string | null,               // "1億未満" | "1-10億" | "10-100億" | "100億以上" | null
  "representative": string | null,        // 代表者名
  "representativePhone": string | null,   // 代表電話番号
  "representativeEmail": string | null    // 代表メール
}`

  const response = await callClaudeHaiku(system, user)
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return {}
  try {
    return JSON.parse(jsonMatch[0]) as EnrichResult
  } catch {
    return {}
  }
}

async function main() {
  const { limit, staleDays, dryRun } = parseArgs()
  console.log('=== 日次企業エンリッチメント ===')
  console.log(`モデル: ${MODEL}`)
  console.log(`制限: ${limit}件 / stale日数: ${staleDays}`)
  if (dryRun) console.log('⚠️ DRY-RUN')

  const staleDate = new Date(Date.now() - staleDays * 24 * 60 * 60 * 1000)

  // 優先順: PENDING → lastEnrichedAt が古い → 大手・インテントありを優先
  const targets = await prisma.companyMaster.findMany({
    where: {
      OR: [
        { enrichmentStatus: EnrichmentStatus.PENDING },
        { enrichmentStatus: EnrichmentStatus.FAILED },
        { lastEnrichedAt: null },
        { lastEnrichedAt: { lt: staleDate } },
      ],
    },
    orderBy: [
      { enrichmentStatus: 'asc' }, // PENDING が先
      { lastEnrichedAt: 'asc' },
      { updatedAt: 'asc' },
    ],
    take: limit,
  })

  console.log(`対象: ${targets.length}社`)

  let success = 0
  let failed = 0

  for (const t of targets) {
    try {
      if (!dryRun) {
        await prisma.companyMaster.update({
          where: { id: t.id },
          data: { enrichmentStatus: EnrichmentStatus.IN_PROGRESS },
        })
      }

      const result = await enrichOne(t.id, t.name, t.prefecture)

      if (!dryRun) {
        await prisma.companyMaster.update({
          where: { id: t.id },
          data: {
            websiteUrl: result.websiteUrl ?? t.websiteUrl,
            serviceSummary: result.serviceSummary ?? t.serviceSummary,
            companyFeatures: result.companyFeatures ?? t.companyFeatures,
            employeeCount: result.employeeCount ?? t.employeeCount,
            revenue: result.revenue ?? t.revenue,
            representative: result.representative ?? t.representative,
            representativePhone: result.representativePhone ?? t.representativePhone,
            representativeEmail: result.representativeEmail ?? t.representativeEmail,
            enrichmentStatus: EnrichmentStatus.COMPLETED,
            lastEnrichedAt: new Date(),
          },
        })
      }

      success++
      console.log(`    ✓ 完了`)
    } catch (e) {
      failed++
      console.error(`    ✗ 失敗: ${(e as Error).message}`)
      if (!dryRun) {
        await prisma.companyMaster.update({
          where: { id: t.id },
          data: { enrichmentStatus: EnrichmentStatus.FAILED },
        })
      }
    }

    // レート制限対策
    await new Promise((r) => setTimeout(r, 500))
  }

  console.log('\n=== 完了 ===')
  console.log(`成功: ${success} / 失敗: ${failed}`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('❌ エラー:', e)
  await prisma.$disconnect()
  process.exit(1)
})
