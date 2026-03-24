import { z } from 'zod'
import { router, protectedProcedure } from '../middleware/trpc'

export const companiesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        rank: z.enum(['S', 'A', 'B', 'C', 'D']).optional(),
        leadSource: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const companies = await ctx.prisma.company.findMany({
        where: {
          orgId: ctx.orgId,
          ...(input.search && {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { domain: { contains: input.search, mode: 'insensitive' } },
            ],
          }),
          ...(input.rank && { leadRank: input.rank }),
          ...(input.leadSource && { leadSource: input.leadSource as never }),
        },
        include: {
          owner: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { contacts: true, deals: true } },
        },
        orderBy: [{ leadScore: 'desc' }, { updatedAt: 'desc' }],
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      })

      let nextCursor: string | undefined
      if (companies.length > input.limit) {
        const next = companies.pop()!
        nextCursor = next.id
      }

      return { items: companies, nextCursor }
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const company = await ctx.prisma.company.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
        include: {
          owner: { select: { id: true, name: true, avatarUrl: true } },
          contacts: { orderBy: { createdAt: 'desc' } },
          deals: {
            orderBy: { updatedAt: 'desc' },
            include: { owner: { select: { id: true, name: true } } },
          },
          activities: {
            orderBy: { occurredAt: 'desc' },
            take: 20,
            include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          },
          scoreEvents: { orderBy: { occurredAt: 'desc' }, take: 10 },
        },
      })
      return company
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        domain: z.string().optional(),
        phone: z.string().optional(),
        industry: z.string().optional(),
        employeeRange: z.string().optional(),
        revenueRange: z.string().optional(),
        prefecture: z.string().optional(),
        corporateNumber: z.string().optional(),
        leadSource: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.company.create({
        data: {
          ...input,
          orgId: ctx.orgId,
          ownerId: ctx.userId,
          employeeRange: input.employeeRange as never,
          revenueRange: input.revenueRange as never,
          leadSource: input.leadSource as never,
        },
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        domain: z.string().optional(),
        phone: z.string().optional(),
        industry: z.string().optional(),
        employeeRange: z.string().optional(),
        revenueRange: z.string().optional(),
        prefecture: z.string().optional(),
        corporateNumber: z.string().optional(),
        leadSource: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.company.update({
        where: { id, orgId: ctx.orgId },
        data: data as never,
      })
    }),
})
