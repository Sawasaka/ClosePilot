/**
 * 組織図・担当者名エンリッチメント：公開情報から部門構造と担当者を抽出する。
 *
 * 収集対象:
 *   - 部門別（営業/IT/人事/マーケ等）の代表番号・メールアドレス
 *   - 公開されている担当者名・役職
 *   - 部門の頭数（従業員数レンジ）
 *
 * 使い方:
 *   pnpm enrich:orgchart                  # 優先度順で全件処理
 *   pnpm enrich:orgchart --limit=20
 *   pnpm enrich:orgchart --company-id=xxx # 特定企業のみ
 *
 * 前提:
 *   ANTHROPIC_API_KEY / SERPER_API_KEY が設定済み
 */

import { PrismaClient, DepartmentType } from '@prisma/client'

const prisma = new PrismaClient({ log: ['error'] })

const MODEL = 'claude-haiku-4-5-20251001'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const SERPER_API_KEY = process.env.SERPER_API_KEY

interface OrgChartResult {
  departments: Array<{
    name: string
    departmentType: string | null
    phone: string | null
    email: string | null
    contactPersonName: string | null
    contactPersonTitle: string | null
    headcount: string | null
  }>
}

function parseArgs() {
  const args = process.argv.slice(2)
  const limit = parseInt(args.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '20', 10)
  const companyId = args.find((a) => a.startsWith('--company-id='))?.split('=')[1] ?? null
  return { limit, companyId }
}

function mapDepartmentType(s: string | null): DepartmentType | null {
  if (!s) return null
  const up = s.toUpperCase()
  return (DepartmentType as Record<string, DepartmentType>)[up] ?? null
}

async function serperSearch(query: string) {
  if (!SERPER_API_KEY) return []
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, gl: 'jp', hl: 'ja', num: 5 }),
  })
  if (!res.ok) return []
  const json: { organic?: Array<{ title?: string; link?: string; snippet?: string }> } = await res.json()
  return (json.organic ?? []).map((r) => ({ title: r.title ?? '', link: r.link ?? '', snippet: r.snippet ?? '' }))
}

async function jinaFetch(url: string): Promise<string> {
  const res = await fetch(`https://r.jina.ai/${url}`, {
    headers: process.env.JINA_API_KEY ? { Authorization: `Bearer ${process.env.JINA_API_KEY}` } : {},
  })
  if (!res.ok) return ''
  return (await res.text()).slice(0, 12000)
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
    body: JSON.stringify({ model: MODEL, max_tokens: 2048, system, messages: [{ role: 'user', content: user }] }),
  })
  if (!res.ok) throw new Error(`Claude API error: ${res.status}`)
  const json: { content?: Array<{ text?: string }> } = await res.json()
  return json.content?.[0]?.text ?? ''
}

async function extractOrgChart(company: { id: string; name: string; websiteUrl: string | null }): Promise<OrgChartResult> {
  console.log(`  🏢 ${company.name}`)

  // 検索: 会社概要 / 組織 / 問い合わせ
  const queries = [
    `${company.name} 会社概要 部門`,
    `${company.name} 問い合わせ 部署`,
    `${company.name} 組織図`,
  ]
  const allHits: Array<{ title: string; link: string; snippet: string }> = []
  for (const q of queries) {
    const hits = await serperSearch(q)
    allHits.push(...hits.slice(0, 3))
  }

  // トップ3の本文を取得
  const topUrls = [...new Set(allHits.slice(0, 5).map((h) => h.link))].slice(0, 3)
  const bodies: string[] = []
  for (const url of topUrls) {
    const body = await jinaFetch(url)
    if (body) bodies.push(`--- ${url} ---\n${body.slice(0, 4000)}`)
  }

  const system = `あなたは企業の組織構造を調査する専門家です。与えられた情報から公開されている部門情報を抽出してJSONで返します。
- 憶測は避け、本文に明記されている情報だけ使ってください
- 個人情報（プライベートな連絡先）は含めないでください
- 役職のある公開担当者（営業部長、広報責任者等）は含めてよい`

  const user = `企業名: ${company.name}
公式サイト: ${company.websiteUrl ?? '不明'}

検索結果とページ本文:
${bodies.join('\n\n')}

以下のJSON形式で返してください（departmentsは最大10件）:
{
  "departments": [
    {
      "name": "営業部",
      "departmentType": "SALES",              // SALES|MARKETING|ENGINEERING|IT|HR|FINANCE|LEGAL|OPERATIONS|MANAGEMENT|RD|CS|OTHER
      "phone": "03-1234-5678" or null,
      "email": "sales@example.com" or null,
      "contactPersonName": "山田太郎" or null,
      "contactPersonTitle": "営業部長" or null,
      "headcount": "11-50" or null           // 1-10 | 11-50 | 51-200 | 201-1000 | 1000+
    }
  ]
}`

  const response = await callClaudeHaiku(system, user)
  const match = response.match(/\{[\s\S]*\}/)
  if (!match) return { departments: [] }
  try {
    return JSON.parse(match[0]) as OrgChartResult
  } catch {
    return { departments: [] }
  }
}

async function main() {
  const { limit, companyId } = parseArgs()
  console.log('=== 組織図・担当者エンリッチ ===')
  console.log(`モデル: ${MODEL} / 制限: ${limit}件`)

  const where = companyId ? { id: companyId } : { enrichmentStatus: 'COMPLETED' as const }
  const targets = await prisma.companyMaster.findMany({
    where,
    orderBy: { updatedAt: 'asc' },
    take: limit,
  })

  console.log(`対象: ${targets.length}社`)

  let success = 0
  let failed = 0

  for (const t of targets) {
    try {
      const result = await extractOrgChart({ id: t.id, name: t.name, websiteUrl: t.websiteUrl })

      for (const dept of result.departments) {
        const deptType = mapDepartmentType(dept.departmentType)
        // 既存の部門（同一企業×同一名）があれば update、なければ create
        const existing = await prisma.department.findFirst({
          where: { companyMasterId: t.id, name: dept.name },
        })
        if (existing) {
          await prisma.department.update({
            where: { id: existing.id },
            data: {
              departmentType: deptType ?? existing.departmentType,
              phone: dept.phone ?? existing.phone,
              email: dept.email ?? existing.email,
              contactPersonName: dept.contactPersonName ?? existing.contactPersonName,
              contactPersonTitle: dept.contactPersonTitle ?? existing.contactPersonTitle,
              headcount: dept.headcount ?? existing.headcount,
            },
          })
        } else {
          await prisma.department.create({
            data: {
              companyMasterId: t.id,
              name: dept.name,
              departmentType: deptType,
              phone: dept.phone,
              email: dept.email,
              contactPersonName: dept.contactPersonName,
              contactPersonTitle: dept.contactPersonTitle,
              headcount: dept.headcount,
            },
          })
        }
      }

      success++
      console.log(`    ✓ ${result.departments.length}部門`)
    } catch (e) {
      failed++
      console.error(`    ✗ 失敗: ${(e as Error).message}`)
    }

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
