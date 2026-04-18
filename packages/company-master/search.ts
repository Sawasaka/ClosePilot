import { prisma, CompanyMaster, Prisma, EnrichmentStatus, IntentLevel } from '@closepilot/db'

export type SearchFilters = {
  query?: string
  prefecture?: string
  industryId?: string
  employeeCount?: string
  enrichmentStatus?: EnrichmentStatus
  intentLevel?: IntentLevel
  serviceTagIds?: string[]
}

export type SearchOptions = {
  filters?: SearchFilters
  take?: number
  skip?: number
  orderBy?: 'name' | 'updatedAt' | 'latestIntent'
}

export type CompanyMasterWithRelations = Prisma.CompanyMasterGetPayload<{
  include: {
    industry: true
    serviceTags: { include: { tag: true } }
    companyIntents: true
    _count: { select: { offices: true; departments: true; intentSignals: true } }
  }
}>

/**
 * 企業マスターを検索する。名前/法人番号の部分一致、業種・都道府県・インテントレベル等で絞り込み可能。
 */
export async function searchCompanyMaster(
  options: SearchOptions = {},
): Promise<{ data: CompanyMasterWithRelations[]; total: number }> {
  const { filters = {}, take = 50, skip = 0, orderBy = 'name' } = options

  const where: Prisma.CompanyMasterWhereInput = {}

  if (filters.query) {
    where.OR = [
      { name: { contains: filters.query, mode: 'insensitive' } },
      { corporateNumber: { contains: filters.query } },
      { nameKana: { contains: filters.query, mode: 'insensitive' } },
    ]
  }
  if (filters.prefecture) where.prefecture = filters.prefecture
  if (filters.industryId) where.industryId = filters.industryId
  if (filters.employeeCount) where.employeeCount = filters.employeeCount
  if (filters.enrichmentStatus) where.enrichmentStatus = filters.enrichmentStatus

  if (filters.intentLevel) {
    where.companyIntents = {
      some: { intentLevel: filters.intentLevel },
    }
  }

  if (filters.serviceTagIds && filters.serviceTagIds.length > 0) {
    where.serviceTags = {
      some: { tagId: { in: filters.serviceTagIds } },
    }
  }

  const orderByClause: Prisma.CompanyMasterOrderByWithRelationInput =
    orderBy === 'name'
      ? { name: 'asc' }
      : orderBy === 'updatedAt'
        ? { updatedAt: 'desc' }
        : { updatedAt: 'desc' }

  const [data, total] = await Promise.all([
    prisma.companyMaster.findMany({
      where,
      take,
      skip,
      orderBy: orderByClause,
      include: {
        industry: true,
        serviceTags: { include: { tag: true } },
        companyIntents: true,
        _count: { select: { offices: true, departments: true, intentSignals: true } },
      },
    }),
    prisma.companyMaster.count({ where }),
  ])

  return { data, total }
}

/**
 * 法人番号で企業マスターを一件取得。関連データも含めて返す。
 */
export async function getCompanyMasterByCorporateNumber(corporateNumber: string) {
  return prisma.companyMaster.findUnique({
    where: { corporateNumber },
    include: {
      industry: true,
      serviceTags: { include: { tag: true } },
      offices: { orderBy: { isPrimary: 'desc' } },
      departments: {
        where: { parentDepartmentId: null },
        include: {
          childDepartments: { include: { childDepartments: true } },
        },
      },
      companyIntents: { orderBy: { latestSignalAt: 'desc' } },
      intentSignals: {
        orderBy: { publishedAt: 'desc' },
        take: 50,
      },
    },
  })
}

/**
 * IDで企業マスターを一件取得。
 */
export async function getCompanyMasterById(id: string) {
  return prisma.companyMaster.findUnique({
    where: { id },
    include: {
      industry: true,
      serviceTags: { include: { tag: true } },
      offices: { orderBy: { isPrimary: 'desc' } },
      departments: {
        where: { parentDepartmentId: null },
        include: {
          childDepartments: { include: { childDepartments: true } },
        },
      },
      companyIntents: { orderBy: { latestSignalAt: 'desc' } },
      intentSignals: {
        orderBy: { publishedAt: 'desc' },
        take: 50,
      },
    },
  })
}
