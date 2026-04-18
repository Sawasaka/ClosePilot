/**
 * DB接続テスト & 既存テーブル一覧取得
 * 読み取りのみ、一切の書き込みなし
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ['error'] })

type TableRow = { table_name: string; table_type: string }
type EnumRow = { typname: string }
type CountRow = { count: bigint }

async function main() {
  console.log('🔌 Supabase DBに接続中...')

  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ 接続成功\n')
  } catch (e) {
    console.error('❌ 接続失敗:', (e as Error).message)
    process.exit(1)
  }

  // 既存テーブル一覧
  const tables = await prisma.$queryRaw<TableRow[]>`
    SELECT table_name, table_type
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `
  console.log(`📋 既存テーブル数: ${tables.length}`)
  tables.forEach((t) => console.log(`   - ${t.table_name}`))

  // 既存enum型
  const enums = await prisma.$queryRaw<EnumRow[]>`
    SELECT DISTINCT t.typname
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typtype = 'e' AND n.nspname = 'public'
    ORDER BY t.typname
  `
  console.log(`\n🏷️  既存enum型数: ${enums.length}`)
  enums.forEach((e) => console.log(`   - ${e.typname}`))

  // 主要テーブルのレコード件数
  console.log('\n📊 主要テーブル件数:')
  const keyTables = ['companies', 'offices', 'departments', 'intent_signals', 'company_intents', 'industries', 'service_tags', 'company_tags']
  for (const t of keyTables) {
    if (!tables.some((row) => row.table_name === t)) continue
    try {
      const result = await prisma.$queryRawUnsafe<CountRow[]>(`SELECT COUNT(*)::bigint as count FROM "${t}"`)
      console.log(`   ${t}: ${result[0].count.toString()}件`)
    } catch (e) {
      console.log(`   ${t}: エラー (${(e as Error).message})`)
    }
  }

  // Prismaが作ろうとしている新テーブル名との衝突チェック
  const prismaNewTables = [
    'CompanyMaster', 'Office', 'Department', 'IntentSignal', 'CompanyIntent',
    'Industry', 'ServiceTag', 'CompanyServiceTag',
    'Organization', 'User', 'Company', 'Contact', 'Deal', 'Activity', 'Task',
    'Sequence', 'SequenceStep', 'ScoreEvent', 'Transcript', 'StageHistory',
    'ResearchBrief', 'KnowledgeDoc', 'KnowledgeChunk', 'RagQuery',
  ]
  const conflicts = prismaNewTables.filter((n) => tables.some((t) => t.table_name === n))
  console.log('\n🔍 Prisma新テーブル名との衝突:')
  if (conflicts.length === 0) {
    console.log('   ✅ 衝突なし（PascalCase vs snake_case で分離）')
  } else {
    console.log(`   ⚠️ ${conflicts.length}件の衝突:`)
    conflicts.forEach((c) => console.log(`      - ${c}`))
  }

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('❌ エラー:', e)
  await prisma.$disconnect()
  process.exit(1)
})
