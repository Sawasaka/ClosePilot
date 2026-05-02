/**
 * abm-tool（Supabase）→ bgm（Prisma/PostgreSQL）
 * 企業マスターデータ移行スクリプト
 *
 * 使い方:
 *   .env.local に以下を設定:
 *     DATABASE_URL              … bgm側の接続URL
 *     ABM_SUPABASE_URL          … abm-toolのSupabase URL
 *     ABM_SUPABASE_SERVICE_KEY  … abm-toolのservice_role key
 *
 *   pnpm --filter @bgm/db import:abm [--dry-run] [--limit=100]
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { PrismaClient, EnrichmentStatus, OfficeType, DepartmentType, IntentSignalType, IntentLevel } from '@prisma/client'

const prisma = new PrismaClient({ log: ['error'] })

const BATCH_SIZE = 500
const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const LIMIT = parseLimit(argv)

function parseLimit(args: string[]): number | null {
  const arg = args.find((a) => a.startsWith('--limit='))
  return arg ? parseInt(arg.split('=')[1], 10) : null
}

function requireEnv(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`環境変数 ${key} が未設定です`)
  return v
}

function mapEnrichmentStatus(s: string | null | undefined): EnrichmentStatus {
  switch (s) {
    case 'pending': return EnrichmentStatus.PENDING
    case 'in_progress': return EnrichmentStatus.IN_PROGRESS
    case 'completed': return EnrichmentStatus.COMPLETED
    case 'failed': return EnrichmentStatus.FAILED
    default: return EnrichmentStatus.PENDING
  }
}

function mapOfficeType(s: string | null | undefined): OfficeType {
  switch (s) {
    case 'headquarters': return OfficeType.HEADQUARTERS
    case 'branch': return OfficeType.BRANCH
    case 'sales_office': return OfficeType.SALES_OFFICE
    case 'factory': return OfficeType.FACTORY
    case 'lab': return OfficeType.LAB
    default: return OfficeType.OTHER
  }
}

function mapDepartmentType(s: string | null | undefined): DepartmentType | null {
  if (!s) return null
  const up = s.toUpperCase().replace(/-/g, '_')
  return (DepartmentType as Record<string, DepartmentType>)[up] ?? null
}

function mapIntentLevel(s: string | null | undefined): IntentLevel {
  switch (s) {
    case 'hot': return IntentLevel.HOT
    case 'middle': return IntentLevel.MIDDLE
    case 'low': return IntentLevel.LOW
    default: return IntentLevel.NONE
  }
}

function mapSignalType(s: string | null | undefined): IntentSignalType {
  switch (s) {
    case 'job_posting':
    case 'job': return IntentSignalType.JOB_POSTING
    case 'press_release':
    case 'press': return IntentSignalType.PRESS_RELEASE
    case 'news': return IntentSignalType.NEWS
    case 'funding': return IntentSignalType.FUNDING
    case 'product_launch':
    case 'product': return IntentSignalType.PRODUCT_LAUNCH
    case 'event': return IntentSignalType.EVENT
    default: return IntentSignalType.OTHER
  }
}

// Supabaseから全件取得（1000件/ページの制限を超えてページネーション）
async function fetchAll<T>(sb: SupabaseClient, table: string): Promise<T[]> {
  const rows: T[] = []
  const pageSize = 1000
  let from = 0
  while (true) {
    const to = from + pageSize - 1
    const { data, error } = await sb.from(table).select('*').range(from, to)
    if (error) throw new Error(`[${table}] ${error.message}`)
    if (!data || data.length === 0) break
    rows.push(...(data as T[]))
    if (data.length < pageSize) break
    from += pageSize
    if (LIMIT && rows.length >= LIMIT) return rows.slice(0, LIMIT)
  }
  return rows
}

type AbmCompany = {
  id: string
  corporate_number: string
  name: string
  name_kana: string | null
  prefecture: string
  city: string | null
  address: string | null
  corporate_type: string
  website_url: string | null
  industry_id: string | null
  service_summary: string | null
  company_features: string | null
  employee_count: string | null
  revenue: string | null
  enrichment_status: string
  created_at: string
  updated_at: string
}

type AbmIndustry = { id: string; name: string; category: string | null }
type AbmServiceTag = { id: string; name: string }
type AbmCompanyTag = { company_id: string; tag_id: string }
type AbmOffice = {
  id: string
  company_id: string
  name: string
  office_type: string
  prefecture: string | null
  city: string | null
  address: string | null
  phone: string | null
  website_url: string | null
  is_primary: boolean
}
type AbmDepartment = {
  id: string
  company_id: string
  office_id: string | null
  name: string
  department_type: string | null
  parent_department_id: string | null
  headcount: string | null
  description: string | null
}
type AbmIntentSignal = {
  id: string
  company_id: string
  department_type: string
  signal_type: string | null
  title: string
  source_url: string
  source_name: string | null
  posted_date: string | null
  discovered_at: string
  raw_data: Record<string, unknown> | null
}
type AbmCompanyIntent = {
  id: string
  company_id: string
  department_type: string
  intent_level: string
  signal_count: number
  latest_signal_date: string | null
}

async function main() {
  console.log('🚀 abm-tool → bgm データ移行開始')
  if (DRY_RUN) console.log('⚠️  DRY-RUN モード（DB書き込みなし）')
  if (LIMIT) console.log(`⚠️  LIMIT=${LIMIT} で制限取得`)

  const sb = createClient(requireEnv('ABM_SUPABASE_URL'), requireEnv('ABM_SUPABASE_SERVICE_KEY'), {
    auth: { persistSession: false },
  })

  // ========== 1. Industry マスタ ==========
  console.log('\n[1/7] industries 取得')
  const abmIndustries = await fetchAll<AbmIndustry>(sb, 'industries')
  const industryIdMap = new Map<string, string>() // abm UUID → bgm cuid

  for (const ind of abmIndustries) {
    if (DRY_RUN) {
      industryIdMap.set(ind.id, `dry-${ind.id}`)
      continue
    }
    const row = await prisma.industry.upsert({
      where: { name: ind.name },
      update: { category: ind.category },
      create: { name: ind.name, category: ind.category },
    })
    industryIdMap.set(ind.id, row.id)
  }
  console.log(`   ✓ ${abmIndustries.length} 件 industries`)

  // ========== 2. ServiceTag マスタ ==========
  console.log('\n[2/7] service_tags 取得')
  const abmTags = await fetchAll<AbmServiceTag>(sb, 'service_tags')
  const tagIdMap = new Map<string, string>()

  for (const tag of abmTags) {
    if (DRY_RUN) {
      tagIdMap.set(tag.id, `dry-${tag.id}`)
      continue
    }
    const row = await prisma.serviceTag.upsert({
      where: { name: tag.name },
      update: {},
      create: { name: tag.name },
    })
    tagIdMap.set(tag.id, row.id)
  }
  console.log(`   ✓ ${abmTags.length} 件 service_tags`)

  // ========== 3. Companies → CompanyMaster ==========
  console.log('\n[3/7] companies 取得')
  const abmCompanies = await fetchAll<AbmCompany>(sb, 'companies')
  const companyIdMap = new Map<string, string>()

  for (let i = 0; i < abmCompanies.length; i += BATCH_SIZE) {
    const batch = abmCompanies.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async (c) => {
      if (DRY_RUN) {
        companyIdMap.set(c.id, `dry-${c.id}`)
        return
      }
      const row = await prisma.companyMaster.upsert({
        where: { corporateNumber: c.corporate_number },
        update: {
          name: c.name,
          nameKana: c.name_kana,
          websiteUrl: c.website_url,
          prefecture: c.prefecture,
          city: c.city,
          address: c.address,
          corporateType: c.corporate_type,
          industryId: c.industry_id ? industryIdMap.get(c.industry_id) : null,
          serviceSummary: c.service_summary,
          companyFeatures: c.company_features,
          employeeCount: c.employee_count,
          revenue: c.revenue,
          enrichmentStatus: mapEnrichmentStatus(c.enrichment_status),
          sourceId: c.id,
          lastEnrichedAt: c.enrichment_status === 'completed' ? new Date(c.updated_at) : null,
        },
        create: {
          corporateNumber: c.corporate_number,
          name: c.name,
          nameKana: c.name_kana,
          websiteUrl: c.website_url,
          prefecture: c.prefecture,
          city: c.city,
          address: c.address,
          corporateType: c.corporate_type,
          industryId: c.industry_id ? industryIdMap.get(c.industry_id) : null,
          serviceSummary: c.service_summary,
          companyFeatures: c.company_features,
          employeeCount: c.employee_count,
          revenue: c.revenue,
          enrichmentStatus: mapEnrichmentStatus(c.enrichment_status),
          sourceId: c.id,
          lastEnrichedAt: c.enrichment_status === 'completed' ? new Date(c.updated_at) : null,
        },
      })
      companyIdMap.set(c.id, row.id)
    }))
    process.stdout.write(`   進捗: ${Math.min(i + BATCH_SIZE, abmCompanies.length)}/${abmCompanies.length}\r`)
  }
  console.log(`\n   ✓ ${abmCompanies.length} 件 companies → CompanyMaster`)

  // ========== 4. company_tags ==========
  console.log('\n[4/7] company_tags 取得')
  const abmCompanyTags = await fetchAll<AbmCompanyTag>(sb, 'company_tags')
  if (!DRY_RUN) {
    for (let i = 0; i < abmCompanyTags.length; i += BATCH_SIZE) {
      const batch = abmCompanyTags.slice(i, i + BATCH_SIZE)
      const rows = batch
        .map((ct) => {
          const companyMasterId = companyIdMap.get(ct.company_id)
          const tagId = tagIdMap.get(ct.tag_id)
          if (!companyMasterId || !tagId) return null
          return { companyMasterId, tagId }
        })
        .filter((r): r is { companyMasterId: string; tagId: string } => r !== null)
      await prisma.companyServiceTag.createMany({ data: rows, skipDuplicates: true })
    }
  }
  console.log(`   ✓ ${abmCompanyTags.length} 件 company_tags`)

  // ========== 5. offices ==========
  console.log('\n[5/7] offices 取得')
  const abmOffices = await fetchAll<AbmOffice>(sb, 'offices')
  const officeIdMap = new Map<string, string>()

  for (let i = 0; i < abmOffices.length; i += BATCH_SIZE) {
    const batch = abmOffices.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async (o) => {
      const companyMasterId = companyIdMap.get(o.company_id)
      if (!companyMasterId) return
      if (DRY_RUN) {
        officeIdMap.set(o.id, `dry-${o.id}`)
        return
      }
      const row = await prisma.office.create({
        data: {
          companyMasterId,
          name: o.name,
          officeType: mapOfficeType(o.office_type),
          prefecture: o.prefecture,
          city: o.city,
          address: o.address,
          phone: o.phone,
          websiteUrl: o.website_url,
          isPrimary: o.is_primary,
        },
      })
      officeIdMap.set(o.id, row.id)
    }))
    process.stdout.write(`   進捗: ${Math.min(i + BATCH_SIZE, abmOffices.length)}/${abmOffices.length}\r`)
  }
  console.log(`\n   ✓ ${abmOffices.length} 件 offices`)

  // ========== 6. departments（親子関係があるため2パス） ==========
  console.log('\n[6/7] departments 取得')
  const abmDepartments = await fetchAll<AbmDepartment>(sb, 'departments')
  const deptIdMap = new Map<string, string>()

  // パス1: 親なしでまず作成
  for (let i = 0; i < abmDepartments.length; i += BATCH_SIZE) {
    const batch = abmDepartments.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async (d) => {
      const companyMasterId = companyIdMap.get(d.company_id)
      if (!companyMasterId) return
      if (DRY_RUN) {
        deptIdMap.set(d.id, `dry-${d.id}`)
        return
      }
      const row = await prisma.department.create({
        data: {
          companyMasterId,
          officeId: d.office_id ? officeIdMap.get(d.office_id) : null,
          name: d.name,
          departmentType: mapDepartmentType(d.department_type),
          headcount: d.headcount,
          description: d.description,
        },
      })
      deptIdMap.set(d.id, row.id)
    }))
  }

  // パス2: parent_department_id を後から更新
  if (!DRY_RUN) {
    for (const d of abmDepartments) {
      if (!d.parent_department_id) continue
      const newId = deptIdMap.get(d.id)
      const newParentId = deptIdMap.get(d.parent_department_id)
      if (!newId || !newParentId) continue
      await prisma.department.update({
        where: { id: newId },
        data: { parentDepartmentId: newParentId },
      })
    }
  }
  console.log(`   ✓ ${abmDepartments.length} 件 departments`)

  // ========== 7. intent_signals & company_intents ==========
  console.log('\n[7/7] intent_signals & company_intents 取得')

  const abmIntentSignals = await fetchAll<AbmIntentSignal>(sb, 'intent_signals')
  if (!DRY_RUN) {
    for (let i = 0; i < abmIntentSignals.length; i += BATCH_SIZE) {
      const batch = abmIntentSignals.slice(i, i + BATCH_SIZE)
      const rows = batch
        .map((s) => {
          const companyMasterId = companyIdMap.get(s.company_id)
          if (!companyMasterId) return null
          return {
            companyMasterId,
            departmentType: mapDepartmentType(s.department_type),
            signalType: mapSignalType(s.signal_type),
            source: s.source_name ?? 'unknown',
            sourceUrl: s.source_url,
            title: s.title,
            publishedAt: s.posted_date ? new Date(s.posted_date) : null,
            rawData: s.raw_data ?? undefined,
            createdAt: new Date(s.discovered_at),
          }
        })
        .filter((r): r is NonNullable<typeof r> => r !== null)
      await prisma.intentSignal.createMany({ data: rows, skipDuplicates: true })
      process.stdout.write(`   intent_signals: ${Math.min(i + BATCH_SIZE, abmIntentSignals.length)}/${abmIntentSignals.length}\r`)
    }
  }
  console.log(`\n   ✓ ${abmIntentSignals.length} 件 intent_signals`)

  const abmCompanyIntents = await fetchAll<AbmCompanyIntent>(sb, 'company_intents')
  if (!DRY_RUN) {
    for (const ci of abmCompanyIntents) {
      const companyMasterId = companyIdMap.get(ci.company_id)
      const departmentType = mapDepartmentType(ci.department_type)
      if (!companyMasterId || !departmentType) continue
      await prisma.companyIntent.upsert({
        where: {
          companyMasterId_departmentType: {
            companyMasterId,
            departmentType,
          },
        },
        update: {
          intentLevel: mapIntentLevel(ci.intent_level),
          signalCount: ci.signal_count,
          latestSignalAt: ci.latest_signal_date ? new Date(ci.latest_signal_date) : null,
        },
        create: {
          companyMasterId,
          departmentType,
          intentLevel: mapIntentLevel(ci.intent_level),
          signalCount: ci.signal_count,
          latestSignalAt: ci.latest_signal_date ? new Date(ci.latest_signal_date) : null,
        },
      })
    }
  }
  console.log(`   ✓ ${abmCompanyIntents.length} 件 company_intents`)

  console.log('\n✅ 移行完了')
  console.log('   企業マスター:', abmCompanies.length)
  console.log('   拠点:', abmOffices.length)
  console.log('   部門:', abmDepartments.length)
  console.log('   インテントシグナル:', abmIntentSignals.length)
  console.log('   企業インテント:', abmCompanyIntents.length)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('❌ エラー:', e)
  await prisma.$disconnect()
  process.exit(1)
})
