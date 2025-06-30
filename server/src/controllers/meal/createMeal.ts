import { mealRepository } from '@server/repositories/mealRepository'
import { chefAuthProcedure } from '@server/trpc/chefAuthProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealInsertableSchema, type MealPublic } from '@server/entities/meal'

export default chefAuthProcedure
  .use(provideRepos({ mealRepository }))
  .input(mealInsertableSchema)
  .mutation(async ({ input: meal, ctx: { repos } }): Promise<MealPublic> => {
    const mealCreated = await repos.mealRepository
      .create(meal)
      .catch((error) => {
        throw error
      })

    return mealCreated
  })
