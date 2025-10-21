import { mealRepository } from '@server/repositories/mealRepository'
import { chefAuthProcedure } from '@server/trpc/chefAuthProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealInsertableSchema, type MealPublic } from '@server/entities/meal'
import { assertError } from '@server/utils/errors'
import { TRPCError } from '@trpc/server'

export default chefAuthProcedure
  .use(provideRepos({ mealRepository }))
  .input(mealInsertableSchema)
  .mutation(async ({ input: meal, ctx: { repos } }): Promise<MealPublic> => {
    if (await repos.mealRepository.mealExists(meal.name)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'meal with this name already exists',
      })
    }
    const mealCreated = await repos.mealRepository
      .create(meal)
      .catch((error: unknown) => {
        assertError(error)
        throw error
      })

    return mealCreated
  })
