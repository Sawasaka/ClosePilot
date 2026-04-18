import { prisma } from '@closepilot/db'

/**
 * テナント側のCompanyを企業マスターに紐付け、マスターの情報をCompany側のローカル項目にコピーする。
 * 既に`masterCompanyId`がある場合は上書きしない（要force=true）。
 */
export async function linkCompanyToMaster(params: {
  companyId: string
  masterCompanyId: string
  force?: boolean
}) {
  const { companyId, masterCompanyId, force = false } = params

  const existing = await prisma.company.findUnique({ where: { id: companyId } })
  if (!existing) throw new Error(`Company not found: ${companyId}`)
  if (existing.masterCompanyId && !force) {
    return existing
  }

  const master = await prisma.companyMaster.findUnique({
    where: { id: masterCompanyId },
    include: { industry: true },
  })
  if (!master) throw new Error(`CompanyMaster not found: ${masterCompanyId}`)

  return prisma.company.update({
    where: { id: companyId },
    data: {
      masterCompanyId: master.id,
      corporateNumber: master.corporateNumber,
      name: master.name,
      prefecture: master.prefecture,
      domain: master.websiteUrl ? extractDomain(master.websiteUrl) : existing.domain,
      industry: master.industry?.name ?? existing.industry,
    },
  })
}

/**
 * 企業マスターからテナント用のCompanyを新規作成する。
 */
export async function createCompanyFromMaster(params: {
  orgId: string
  ownerId: string
  masterCompanyId: string
}) {
  const { orgId, ownerId, masterCompanyId } = params

  const master = await prisma.companyMaster.findUnique({
    where: { id: masterCompanyId },
    include: { industry: true },
  })
  if (!master) throw new Error(`CompanyMaster not found: ${masterCompanyId}`)

  // 既に同テナントで同じマスター企業が登録されていないかチェック
  const existing = await prisma.company.findFirst({
    where: { orgId, masterCompanyId },
  })
  if (existing) return existing

  return prisma.company.create({
    data: {
      orgId,
      ownerId,
      masterCompanyId: master.id,
      corporateNumber: master.corporateNumber,
      name: master.name,
      prefecture: master.prefecture,
      domain: master.websiteUrl ? extractDomain(master.websiteUrl) : null,
      industry: master.industry?.name ?? null,
      leadSource: 'CSV_IMPORT',
    },
  })
}

function extractDomain(url: string): string | null {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}
