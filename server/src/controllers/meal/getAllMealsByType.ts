import { mealRepository } from '@server/repositories/mealRepository'
import { chefAuthProcedure } from '@server/trpc/chefAuthProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealTypeSchema, type MealPublic } from '@server/entities/meal'

export default chefAuthProcedure
  .use(provideRepos({ mealRepository }))
  .input(mealTypeSchema)
  .query(async ({ input: role, ctx: { repos } }): Promise<MealPublic[]> => {
    const meals = await repos.mealRepository.getAllMealsByType(role)

    return meals
  })
