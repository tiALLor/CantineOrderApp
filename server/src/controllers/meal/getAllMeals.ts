import { mealRepository } from '@server/repositories/mealRepository'
import { chefAuthProcedure } from '@server/trpc/chefAuthProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { type MealPublic } from '@server/entities/meal'

export default chefAuthProcedure
  .use(provideRepos({ mealRepository }))
  .query(async ({ ctx: { repos } }): Promise<MealPublic[]> => {
    const meals = await repos.mealRepository.getAllMeals()

    return meals
  })
