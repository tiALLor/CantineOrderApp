import { menuRepository } from '@server/repositories/menuRepository'
import { chefAuthProcedure } from '@server/trpc/chefAuthProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import { idSchema } from '@server/entities/shared'

export default chefAuthProcedure
  .use(provideRepos({ menuRepository }))
  .input(idSchema)
  .mutation(async ({ input: id, ctx: { repos } }): Promise<{ id: number }> => {
    const deletedMenuMeal = await repos.menuRepository
      .deleteMenuMealById(id)
      .catch((error) => {
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
