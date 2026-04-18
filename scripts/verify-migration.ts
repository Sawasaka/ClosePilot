/**
 * データ移行結果の件数照合
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ log: ['error'] })

type CountRow = { count: bigint }

async function main() {
  console.log('📊 移行結果の件数照合\n')

  const pairs: Array<[string, string]> = [
    ['industries', 'Industry'],
    ['service_tags', 'ServiceTag'],
    ['companies', 'CompanyMaster'],
    ['company_tags', 'CompanyServiceTag'],
    ['offices', 'Office'],
    ['departments', 'Department'],
    ['intent_signals', 'IntentSignal'],
    ['company_intents', 'CompanyIntent'],
  ]

  console.log(`${'abm-tool (旧)'.padEnd(20)} | ${'Prisma (新)'.padEnd(22)} | 件数照合`)
  console.log('─'.repeat(65))

  for (const [oldT, newT] of pairs) {
    const oldRes = await prisma.$queryRawUnsafe<CountRow[]>(`SELECT COUNT(*)::bigint as count FROM "${oldT}"`)
    const newRes = await prisma.$queryRawUnsafe<CountRow[]>(`SELECT COUNT(*)::bigint as count FROM "${newT}"`)
    const oldCount = Number(oldRes[0].count)
    const newCount = Number(newRes[0].count)
    const status = oldCount === newCount ? '✅ 一致' : oldCount > newCount ? `⚠️ -${oldCount - newCount}件` : `+${newCount - oldCount}件`
    console.log(`${oldT.padEnd(20)} ${String(oldCount).padStart(7)} | ${newT.padEnd(22)} ${String(newCount).padStart(7)} | ${status}`)
  }

  // インテントレベル分布
  console.log('\n🔥 インテントレベル分布:')
  const levels = await prisma.$queryRaw<{ intentLevel: string; count: bigint }[]>`
    SELECT "intentLevel", COUNT(*)::bigint as count
    FROM "CompanyIntent"
    GROUP BY "intentLevel"
    ORDER BY count DESC
  `
  levels.forEach((l) => console.log(`   ${l.intentLevel}: ${l.count}社`))

  // サンプル確認
  console.log('\n📝 サンプル（HOT インテント企業 Top 5）:')
  const samples = await prisma.companyMaster.findMany({
    where: { companyIntents: { some: { intentLevel: 'HOT' } } },
    take: 5,
    select: {
      name: true,
      prefecture: true,
      employeeCount: true,
      companyIntents: { where: { intentLevel: 'HOT' }, select: { departmentType: true, signalCount: true } },
    },
  })
  samples.forEach((s) => {
    const intents = s.companyIntents.map((i) => `${i.departmentType}:${i.signalCount}`).join(', ')
    console.log(`   ${s.name} (${s.prefecture}, ${s.employeeCount || '?'}) → ${intents}`)
  })

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('❌', e)
  await prisma.$disconnect()
  process.exit(1)
})
