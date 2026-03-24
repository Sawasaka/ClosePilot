import { router } from '../middleware/trpc'
import { companiesRouter } from './companies'
import { contactsRouter } from './contacts'
import { dealsRouter } from './deals'
import { tasksRouter } from './tasks'
import { callsRouter } from './calls'

export const appRouter = router({
  companies: companiesRouter,
  contacts: contactsRouter,
  deals: dealsRouter,
  tasks: tasksRouter,
  calls: callsRouter,
})

export type AppRouter = typeof appRouter
