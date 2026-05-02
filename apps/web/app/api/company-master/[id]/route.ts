import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@bgm/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const company = await prisma.companyMaster.findUnique({
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

  if (!company) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  return NextResponse.json(company)
}
