import { z } from 'zod'
import { mealRepository } from '@server/repositories/mealRepository'
import { chefAuthProcedure } from '@server/trpc/chefAuthProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealUpdateable, type MealPublic } from '@server/entities/meal'
import { TRPCError } from '@trpc/server'
import { idSchema } from '@server/entities/shared'

export default chefAuthProcedure
  .use(provideRepos({ mealRepository }))
  .input(
    z.object({
      id: idSchema,
      mealData: mealUpdateable,
    })
  )
  .mutation(
    async ({
      input: { id, mealData },
      ctx: { repos },
    }): Promise<MealPublic> => {
      const mealUpdated = await repos.mealRepository
        .updateMeal(id, mealData)
        .catch((error) => {
          throw error
        })

      if (!mealUpdated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'meal with meal.id NOT_FOUND',
        })
      }

      return mealUpdated
    }
  )
