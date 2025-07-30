import { z } from 'zod'
import { menuRepository } from '@server/repositories/menuRepository'
import { chefAuthProcedure } from '@server/trpc/chefAuthProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import { idSchema } from '@server/entities/shared'
import { assertError } from '@server/utils/errors'

export default chefAuthProcedure
  .use(provideRepos({ menuRepository }))
  .input(z.object({ id: idSchema }))
  .mutation(async ({ input: id, ctx: { repos } }): Promise<{ id: number }> => {
    const deletedMenuMeal = await repos.menuRepository
      .deleteMenuMealById(id.id)
      .catch((error: unknown) => {
        assertError(error)

        if (error.message.includes('foreign')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Menu being used',
            cause: error,
          })
        }
        throw error
      })

    if (!deletedMenuMeal) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'menu meal with menu.id NOT_FOUND',
      })
    }

    return { id: deletedMenuMeal.id }
  })
