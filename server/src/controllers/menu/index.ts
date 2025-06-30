import { router } from '@server/trpc'
import addMenuMeal from './addMenuMeal'
import getMenuByTypeDates from './getMenuByTypeDates'
import removeMenuMeal from './removeMenuMeal'

export default router({
  addMenuMeal,
  getMenuByTypeDates,
  removeMenuMeal,
})
