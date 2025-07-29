import { mealRepository } from '@server/repositories/mealRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealSchema, type MealPublic } from '@server/entities/meal'

export default authenticatedProcedure
  .use(provideRepos({ mealRepository }))
  .input(mealSchema.pick({ type: true }))
  .mutation(async ({ input: meal, ctx: { repos } }): Promise<MealPublic[]> => {
    const meals = await repos.mealRepository.getAllMealsByType(meal.type)

    return meals
  })
