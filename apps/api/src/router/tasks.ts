import { z } from 'zod'
import { router, protectedProcedure } from '../middleware/trpc'
import { scheduledQueue, JOB_NAMES } from '@bgm/queue'

export const tasksRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        ownerId: z.string().optional(),
        date: z.date().optional(),
        dealId: z.string().optional(),
        contactId: z.string().optional(),
        completed: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.task.findMany({
        where: {
          orgId: ctx.orgId,
          ownerId: input.ownerId ?? ctx.userId,
          ...(input.dealId && { dealId: input.dealId }),
          ...(input.contactId && { contactId: input.contactId }),
          ...(input.date && {
            dueAt: {
              gte: new Date(input.date.toDateString()),
              lt: new Date(new Date(input.date.toDateString()).getTime() + 86400000),
            },
          }),
          ...(input.completed === false && { completedAt: null }),
          ...(input.completed === true && { completedAt: { not: null } }),
        },
        include: {
          contact: { select: { id: true, name: true } },
          deal: { select: { id: true, name: true } },
        },
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'asc' }],
      })
    }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(['CALL', 'EMAIL', 'DOCUMENT', 'MEETING_PREP', 'PROPOSAL', 'OTHER']),
        title: z.string().min(1),
        memo: z.string().optional(),
        dueAt: z.date(),
        dealId: z.string().optional(),
        contactId: z.string().optional(),
        companyId: z.string().optional(),
        source: z.enum(['SEQUENCE_AUTO', 'MODAL_MANUAL', 'MEETING_NOTES', 'MANUAL']).default('MANUAL'),
        reminderSettings: z
          .object({
            dayBefore: z.boolean().default(true),
            thirtyMinBefore: z.boolean().default(true),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.create({
        data: {
          ...input,
          orgId: ctx.orgId,
          ownerId: ctx.userId,
          reminderSettings: input.reminderSettings ?? { dayBefore: true, thirtyMinBefore: true },
        },
      })

      // Slack リマインド をスケジュール
      const reminderSettings = input.reminderSettings ?? { dayBefore: true, thirtyMinBefore: true }

      if (reminderSettings.dayBefore) {
        const dayBefore = new Date(input.dueAt)
        dayBefore.setDate(dayBefore.getDate() - 1)
        dayBefore.setHours(18, 0, 0, 0)
        const delay = dayBefore.getTime() - Date.now()
        if (delay > 0) {
          await scheduledQueue.add(
            JOB_NAMES.SEND_TASK_REMINDER,
            { taskId: task.id, userId: ctx.userId, type: 'day_before' },
            { delay }
          )
        }
      }

      if (reminderSettings.thirtyMinBefore) {
        const thirtyMin = new Date(input.dueAt.getTime() - 30 * 60 * 1000)
        const delay = thirtyMin.getTime() - Date.now()
        if (delay > 0) {
          await scheduledQueue.add(
            JOB_NAMES.SEND_TASK_REMINDER,
            { taskId: task.id, userId: ctx.userId, type: '30min_before' },
            { delay }
          )
        }
      }

      return task
    }),

  complete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        resultCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          completedAt: new Date(),
          resultCode: input.resultCode as never,
        },
        include: { contact: true, deal: true },
      })

      // 活動記録に追加
      await ctx.prisma.activity.create({
        data: {
          orgId: ctx.orgId,
          userId: ctx.userId,
          dealId: task.dealId ?? undefined,
          contactId: task.contactId ?? undefined,
          companyId: task.companyId ?? undefined,
          type: 'TASK_COMPLETED',
          title: `タスク完了: ${task.title}`,
        },
      })

      return task
    }),
})
