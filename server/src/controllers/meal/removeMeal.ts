import { mealRepository } from '@server/repositories/mealRepository'
import { chefAuthProcedure } from '@server/trpc/chefAuthProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import { idSchema } from '@server/entities/shared'

export default chefAuthProcedure
  .use(provideRepos({ mealRepository }))
  .input(idSchema)
  .mutation(async ({ input: id, ctx: { repos } }): Promise<{ id: number }> => {
    const deletedMeal = await repos.mealRepository
      .deleteMealById(id)
      .catch((error) => {
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
