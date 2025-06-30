import { router } from '../trpc'
import user from './user'
import meal from './meal'
import menu from './menu'

export const appRouter = router({
  user,
  meal,
  menu,
})

export type AppRouter = typeof appRouter
