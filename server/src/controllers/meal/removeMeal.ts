import { z } from 'zod'
import { mealRepository } from '@server/repositories/mealRepository'
import { chefAuthProcedure } from '@server/trpc/chefAuthProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import { idSchema } from '@server/entities/shared'
import { assertError } from '@server/utils/errors'

export default chefAuthProcedure
  .use(provideRepos({ mealRepository }))
  .input(z.object({ id: idSchema }))
  .mutation(async ({ input: id, ctx: { repos } }): Promise<{ id: number }> => {
    const deletedMeal = await repos.mealRepository
      .deleteMealById(id.id)
      .catch((error: unknown) => {
        assertError(error)

        if (error.message.includes('foreign')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Meal used in menu',
            cause: error,
          })
        }
        throw error
      })

    if (!deletedMeal) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'meal with meal.id NOT_FOUND',
      })
    }

    return { id: deletedMeal.id }
  })
