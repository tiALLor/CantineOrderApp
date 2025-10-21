import { z } from 'zod'
import { mealRepository } from '@server/repositories/mealRepository'
import { chefAuthProcedure } from '@server/trpc/chefAuthProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealUpdateableSchema, type MealPublic } from '@server/entities/meal'
import { TRPCError } from '@trpc/server'
import { idSchema } from '@server/entities/shared'
import { assertError } from '@server/utils/errors'

export default chefAuthProcedure
  .use(provideRepos({ mealRepository }))
  .input(
    z.object({
      id: idSchema,
      mealData: mealUpdateableSchema,
    })
  )
  .mutation(
    async ({
      input: { id, mealData },
      ctx: { repos },
    }): Promise<MealPublic> => {
      if (
        mealData.name &&
        await repos.mealRepository.mealExists(mealData.name, id)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'meal with this name already exists',
        })
      }
      const mealUpdated = await repos.mealRepository
        .updateMeal(id, mealData)
        .catch((error: unknown) => {
          assertError(error)

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
