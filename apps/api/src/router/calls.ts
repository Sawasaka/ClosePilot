import { z } from 'zod'
import { router, protectedProcedure } from '../middleware/trpc'
import { criticalQueue, JOB_NAMES } from '@bgm/queue'

export const callsRouter = router({
  getToken: protectedProcedure
    .input(z.object({ contactId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { generateBrowserToken } = await import('@bgm/integrations-twilio')
      const token = await generateBrowserToken(`user-${ctx.userId}`)

      await ctx.prisma.contact.update({
        where: { id: input.contactId },
        data: {
          callAttempts: { increment: 1 },
          lastCallAt: new Date(),
        },
      })

      return { token }
    }),

  saveResult: protectedProcedure
    .input(
      z.object({
        callSid: z.string(),
        contactId: z.string(),
        status: z.enum([
          'NOT_STARTED', 'NO_ANSWER', 'ABSENT',
          'CONNECTED', 'DO_NOT_CALL', 'APPOINTMENT_SET', 'NEXT_ACTION',
        ]),
        callResult: z.string().optional(),
        nextAction: z
          .object({
            type: z.enum(['CALL', 'EMAIL', 'DOCUMENT', 'MEETING_PREP', 'PROPOSAL', 'OTHER']),
            title: z.string(),
            memo: z.string().optional(),
            dueAt: z.date(),
          })
          .optional(),
        appointment: z
          .object({
            startAt: z.date(),
            location: z.enum(['meet', 'in_person', 'phone']),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const contact = await ctx.prisma.contact.update({
        where: { id: input.contactId },
        data: {
          approachStatus: input.status,
          lastCallResult: input.callResult as never,
          ...(input.status === 'DO_NOT_CALL' && { doNotContact: true }),
        },
      })

      // 活動記録
      await ctx.prisma.activity.create({
        data: {
          orgId: ctx.orgId,
          contactId: input.contactId,
          companyId: contact.companyId,
          userId: ctx.userId,
          type: 'CALL',
          title: `コール: ${input.status}`,
          resultCode: input.callResult as never,
          metadata: { callSid: input.callSid },
        },
      })

      // Next Action タスクを自動作成
      if (input.nextAction) {
        await ctx.prisma.task.create({
          data: {
            orgId: ctx.orgId,
            contactId: input.contactId,
            companyId: contact.companyId,
            ownerId: ctx.userId,
            source: 'MODAL_MANUAL',
            reminderSettings: { dayBefore: true, thirtyMinBefore: true },
            ...input.nextAction,
          },
        })
      }

      // 録音ファイルを非同期で文字起こし
      await criticalQueue.add(
        JOB_NAMES.TRANSCRIBE_CALL,
        { callSid: input.callSid, contactId: input.contactId, orgId: ctx.orgId }
      )

      return contact
    }),
})
