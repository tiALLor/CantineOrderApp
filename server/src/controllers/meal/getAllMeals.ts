import { mealRepository } from '@server/repositories/mealRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { type MealPublic } from '@server/entities/meal'

export default authenticatedProcedure
  .use(provideRepos({ mealRepository }))
  .query(async ({ ctx: { repos } }): Promise<MealPublic[]> => {
    const meals = await repos.mealRepository.getAllMeals()

    return meals
  })
