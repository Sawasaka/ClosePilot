import { z } from 'zod'
import { router, protectedProcedure } from '../middleware/trpc'

export const contactsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        companyId: z.string().optional(),
        approachStatus: z.string().optional(),
        rank: z.enum(['S', 'A', 'B', 'C', 'D']).optional(),
        search: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const contacts = await ctx.prisma.contact.findMany({
        where: {
          orgId: ctx.orgId,
          ...(input.companyId && { companyId: input.companyId }),
          ...(input.approachStatus && { approachStatus: input.approachStatus as never }),
          ...(input.search && {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { email: { contains: input.search, mode: 'insensitive' } },
            ],
          }),
          ...(input.rank && {
            company: { leadRank: input.rank },
          }),
        },
        include: {
          company: { select: { id: true, name: true, leadRank: true, leadScore: true } },
          currentSeq: { select: { id: true, name: true } },
        },
        orderBy: [{ nextActionAt: 'asc' }, { updatedAt: 'desc' }],
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      })

      let nextCursor: string | undefined
      if (contacts.length > input.limit) {
        const next = contacts.pop()!
        nextCursor = next.id
      }
      return { items: contacts, nextCursor }
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.contact.findFirst({
        where: { id: input.id, orgId: ctx.orgId },
        include: {
          company: true,
          deals: {
            orderBy: { updatedAt: 'desc' },
            include: { owner: { select: { id: true, name: true } } },
          },
          tasks: {
            where: { completedAt: null },
            orderBy: { dueAt: 'asc' },
          },
          activities: {
            orderBy: { occurredAt: 'desc' },
            take: 30,
            include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          },
        },
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        title: z.string().optional(),
        department: z.string().optional(),
        isDecisionMaker: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.contact.create({
        data: { ...input, orgId: ctx.orgId, isOwnerId: ctx.userId },
      })
    }),

  updateApproachStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          'NOT_STARTED', 'NO_ANSWER', 'ABSENT',
          'CONNECTED', 'DO_NOT_CALL', 'APPOINTMENT_SET', 'NEXT_ACTION',
        ]),
        callResult: z.string().optional(),
        nextActionAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const contact = await ctx.prisma.contact.update({
        where: { id: input.id, orgId: ctx.orgId },
        data: {
          approachStatus: input.status,
          lastCallResult: input.callResult as never,
          ...(input.status === 'DO_NOT_CALL' && { doNotContact: true }),
          ...(input.nextActionAt && { nextActionAt: input.nextActionAt }),
        },
      })

      // 活動記録を自動作成
      await ctx.prisma.activity.create({
        data: {
          orgId: ctx.orgId,
          contactId: input.id,
          companyId: contact.companyId,
          userId: ctx.userId,
          type: 'CALL',
          title: `コール結果: ${input.status}`,
          resultCode: input.callResult as never,
        },
      })

      return contact
    }),

  startCall: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { generateBrowserToken } = await import('@bgm/integrations-twilio')
      const token = await generateBrowserToken(`user-${ctx.userId}`)

      // コール試行回数を自動インクリメント
      await ctx.prisma.contact.update({
        where: { id: input.id, orgId: ctx.orgId },
        data: {
          callAttempts: { increment: 1 },
          lastCallAt: new Date(),
        },
      })

      return { token }
    }),
})
