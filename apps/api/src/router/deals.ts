import { z } from 'zod'
import { router, protectedProcedure } from '../middleware/trpc'
import { standardQueue, JOB_NAMES } from '@closepilot/queue'

export const dealsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        stage: z.string().optional(),
        ownerId: z.string().optional(),
        stalled: z.boolean().optional(),
        search: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const deals = await ctx.prisma.deal.findMany({
        where: {
          orgId: ctx.orgId,
          ...(input.stage && { stage: input.stage as never }),
          ...(input.ownerId && { ownerId: input.ownerId }),
          ...(input.stalled === true && { stalledAt: { not: null } }),
          ...(input.search && {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { company: { name: { contains: input.search, mode: 'insensitive' } } },
            ],
          }),
        },
        include: {
          company: { select: { id: true, name: true, leadRank: true } },
          contact: { select: { id: true, name: true } },
          owner: { select: { id: true, name: true, avatarUrl: true } },
          tasks: {
            where: { completedAt: null },
            orderBy: { dueAt: 'asc' },
            take: 1,
          },
        },
        orderBy: [{ stalledAt: 'asc' }, { updatedAt: 'desc' }],
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      })

      let nextCursor: string | undefined
      if (deals.length > input.limit) {
        const next = deals.pop()!
        nextCursor = next.id
      }
      return { items: deals, nextCursor }
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.deal.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
        include: {
          company: true,
          contact: true,
          owner: { select: { id: true, name: true, avatarUrl: true } },
          activities: {
            orderBy: { occurredAt: 'desc' },
            take: 30,
            include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          },
          tasks: {
            where: { completedAt: null },
            orderBy: { dueAt: 'asc' },
          },
          transcripts: { orderBy: { createdAt: 'desc' }, take: 5 },
          researchBrief: true,
          stageHistory: { orderBy: { changedAt: 'desc' } },
        },
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        contactId: z.string().optional(),
        name: z.string().optional(),
        amount: z.number().optional(),
        expectedCloseAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.prisma.company.findUnique({
        where: { id: input.companyId },
        select: { name: true },
      })

      const dealName =
        input.name ??
        `${company?.name ?? '企業'} — ${new Date().toLocaleDateString('ja-JP')}`

      const deal = await ctx.prisma.deal.create({
        data: {
          ...input,
          name: dealName,
          orgId: ctx.orgId,
          ownerId: ctx.userId,
        },
      })

      // Research Brief を90秒後に非同期生成
      await standardQueue.add(
        JOB_NAMES.GENERATE_RESEARCH_BRIEF,
        { dealId: deal.id, companyName: company?.name ?? '' },
        { delay: 90_000 }
      )

      return deal
    }),

  updateStage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        stage: z.enum([
          'NEW_LEAD', 'QUALIFIED', 'FIRST_MEETING', 'SOLUTION_FIT',
          'PROPOSAL', 'NEGOTIATION', 'VERBAL_COMMIT', 'CLOSED_WON', 'CLOSED_LOST',
        ]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const current = await ctx.prisma.deal.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
        select: { stage: true },
      })

      const [deal] = await ctx.prisma.$transaction([
        ctx.prisma.deal.update({
          where: { id: input.id },
          data: {
            stage: input.stage,
            stageChangedAt: new Date(),
            // ステージ変更でstalledAt をリセット
            stalledAt: null,
          },
        }),
        ctx.prisma.stageHistory.create({
          data: {
            dealId: input.id,
            fromStage: current?.stage,
            toStage: input.stage,
            changedBy: ctx.userId,
            reason: input.reason,
          },
        }),
        ctx.prisma.activity.create({
          data: {
            orgId: ctx.orgId,
            dealId: input.id,
            userId: ctx.userId,
            type: 'STAGE_CHANGED',
            title: `ステージ変更: ${current?.stage} → ${input.stage}`,
          },
        }),
      ])

      return deal
    }),

  updateField: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        field: z.string(),
        value: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const allowedFields = [
        'painPoints', 'budget', 'desiredService', 'timeline',
        'decisionMaker', 'competitors', 'blockers', 'currentSolution',
        'nextActionUs', 'nextActionCust', 'lostReason', 'amount',
      ]
      if (!allowedFields.includes(input.field)) {
        throw new Error(`Field ${input.field} is not updatable`)
      }

      return ctx.prisma.deal.update({
        where: { id: input.id, orgId: ctx.orgId },
        data: { [input.field]: input.value },
      })
    }),
})
