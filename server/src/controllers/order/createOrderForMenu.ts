import { orderRepository } from '@server/repositories/orderRepository'
import { menuRepository } from '@server/repositories/menuRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { orderInsertableSchema, type OrderPublic } from '@server/entities/order'
import { TRPCError } from '@trpc/server'
import { assertError } from '@server/utils/errors'

export default authenticatedProcedure
  .use(provideRepos({ orderRepository, menuRepository }))
  .input(orderInsertableSchema)
  .mutation(
    async ({
      input: order,
      ctx: { repos, authUser },
    }): Promise<OrderPublic> => {
      if (order.date <= new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'you can not place orders for today or past',
        })
      }
      const mealIds = await repos.menuRepository.getMealsIdByDate(order.date)

      if (
        (order.soupMealId && !mealIds.includes(order.soupMealId)) ||
        (order.mainMealId && !mealIds.includes(order.mainMealId))
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reference to meal do not exist',
        })
      }

      const orderForMenuMeal = await repos.orderRepository
        .createOrderForMenu({ ...order, userId: authUser.id })
        .catch((error: unknown) => {
          assertError(error)

          if (error.message.includes('foreign')) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Reference to meal do not exist',
              cause: error,
            })
          }
          if (error.message.includes('unique')) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Order for date and user already exist',
              cause: error,
            })
          }

          throw error
        })
      return orderForMenuMeal
    }
  )
