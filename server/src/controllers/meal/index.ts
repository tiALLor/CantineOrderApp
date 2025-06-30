import { router } from '@server/trpc'
import createMeal from './createMeal'
import getAllMeals from './getAllMeals'
import getAllMealsByType from './getAllMealsByType'
import updateMeal from './updateMeal'
import removeMeal from './removeMeal'

export default router({
  createMeal,
  getAllMeals,
  getAllMealsByType,
  updateMeal,
  removeMeal,
  // getMealById,
})
