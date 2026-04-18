import { prisma } from '@closepilot/db'
import CompanyDetailClient from './CompanyDetailClient'

// SSR：リクエスト時にサーバー側でデータ取得 → HTMLと一緒に返す（HubSpot風の瞬時表示）
export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // モックID（1,2,3等）の場合は fetch しない
  const looksLikeUuidOrCuid = id.length >= 20
  const initialData = looksLikeUuidOrCuid
    ? await prisma.companyMaster
        .findUnique({
          where: { id },
          include: {
            industry: true,
            serviceTags: { include: { tag: true } },
            offices: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] },
            departments: {
              where: { parentDepartmentId: null },
              orderBy: { createdAt: 'asc' },
              include: {
                childDepartments: {
                  orderBy: { createdAt: 'asc' },
                  include: { childDepartments: true },
                },
              },
            },
            companyIntents: { orderBy: { latestSignalAt: 'desc' } },
            intentSignals: {
              orderBy: { publishedAt: 'desc' },
              take: 50,
              select: {
                id: true,
                departmentType: true,
                signalType: true,
                source: true,
                sourceUrl: true,
                title: true,
                publishedAt: true,
                createdAt: true,
              },
            },
            _count: { select: { offices: true, departments: true, intentSignals: true } },
          },
        })
        // Dateなどを文字列化（Client Component渡す前にシリアライズ可能な形に）
        .then((c) =>
          c
            ? JSON.parse(
                JSON.stringify(c, (_k, v) => (v instanceof Date ? v.toISOString() : v)),
              )
            : null,
        )
        .catch(() => null)
    : null

  return <CompanyDetailClient id={id} initialData={initialData} />
}
