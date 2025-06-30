import { menuRepository } from '@server/repositories/menuRepository'
import { chefAuthProcedure } from '@server/trpc/chefAuthProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { menuInsertableSchema, type MenuPublic } from '@server/entities/menu'
import { TRPCError } from '@trpc/server'

export default chefAuthProcedure
  .use(provideRepos({ menuRepository }))
  .input(menuInsertableSchema)
  .mutation(
    async ({ input: menuMeal, ctx: { repos } }): Promise<MenuPublic> => {
      const exists = await repos.menuRepository.menuMealExists(menuMeal)

      if (exists) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'meal in menu with specified day exists',
        })
      }

      const menuMealCreated = await repos.menuRepository
        .createMenuMeal(menuMeal)
        .catch((error) => {
          throw error
        })

      return menuMealCreated
    }
  )
