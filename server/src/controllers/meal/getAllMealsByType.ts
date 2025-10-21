import { mealRepository } from '@server/repositories/mealRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { mealSchema, type MealPublic } from '@server/entities/meal'
import { z } from 'zod'

const PaginatedMealsInputSchema = mealSchema
  .pick({ type: true })
  .extend({
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    // If page is provided, pageSize must also be provided.
    if (data.page && !data.pageSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'pageSize must be provided when page is specified for pagination.',
        path: ['pageSize'],
      })
    }
  })

export default authenticatedProcedure
  .use(provideRepos({ mealRepository }))
  .input(PaginatedMealsInputSchema)
  .query(
    async ({
      input: { type, page, pageSize },
      ctx: { repos },
    }): Promise<{ meals: MealPublic[]; totalPages: number }> => {
      const meals = await repos.mealRepository.getAllMealsByType(
        type,
        page,
        pageSize
      )

      return meals
    }
  )
