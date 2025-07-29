import { menuRepository } from '@server/repositories/menuRepository'
import { chefAuthProcedure } from '@server/trpc/chefAuthProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { menuInsertableSchema, type MenuPublic } from '@server/entities/menu'
import { TRPCError } from '@trpc/server'
import { assertError } from '@server/utils/errors'

export default chefAuthProcedure
  .use(provideRepos({ menuRepository }))
  .input(menuInsertableSchema)
  .mutation(
    async ({ input: menuMeal, ctx: { repos } }): Promise<MenuPublic> => {
      if (menuMeal.date <= new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'you can not create menu for today or past',
        })
      }

      const exists = await repos.menuRepository.menuMealExists(menuMeal)

      if (exists) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'meal in menu with specified day already exists',
        })
      }

      const menuMealCreated = await repos.menuRepository
        .createMenuMeal(menuMeal)
        .catch((error: unknown) => {
          assertError(error)

          if (error.message.includes('foreign')) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Reference to meal do not exist',
              cause: error,
            })
          }
          if (error.message.includes('duplicate key')) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Meal already exist in the day menu',
              cause: error,
            })
          }

          throw error
        })

      return menuMealCreated
    }
  )
