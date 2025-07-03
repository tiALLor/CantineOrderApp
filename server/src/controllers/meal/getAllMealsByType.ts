import { mealRepository } from '@server/repositories/mealRepository'
import { chefAuthProcedure } from '@server/trpc/chefAuthProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealSchema, type MealPublic } from '@server/entities/meal'

export default chefAuthProcedure
  .use(provideRepos({ mealRepository }))
  .input(mealSchema.pick({ type: true }))
  .mutation(async ({ input: meal, ctx: { repos } }): Promise<MealPublic[]> => {
    const meals = await repos.mealRepository.getAllMealsByType(meal.type)

    return meals
  })
