import { orderRepository } from '@server/repositories/orderRepository'
import { menuRepository } from '@server/repositories/menuRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { orderUpdateableSchema, type OrderPublic } from '@server/entities/order'
import { TRPCError } from '@trpc/server'
import { assertError } from '@server/utils/errors'

export default authenticatedProcedure
  .use(provideRepos({ orderRepository, menuRepository }))
  .input(orderUpdateableSchema)
  .mutation(
    async ({
      input: updateData,
      ctx: { repos, authUser },
    }): Promise<OrderPublic> => {
      if (updateData.date <= new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'you can not place orders for today or past',
        })
      }

      const mealIds = await repos.menuRepository.getMealsIdByDate(
        updateData.date
      )

      if (
        (updateData.soupMealId && !mealIds.includes(updateData.soupMealId)) ||
        (updateData.mainMealId && !mealIds.includes(updateData.mainMealId))
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reference to meal do not exist',
        })
      }

      if (
        !(await repos.orderRepository.orderExists(authUser.id, updateData.date))
      ) {
        const createdOrder = await repos.orderRepository
          .createOrderForMenu({
            userId: authUser.id,
            ...updateData,
          })
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
        return createdOrder
      }

      const updatedOrder = await repos.orderRepository
        .updateOrder(authUser.id, updateData)
        .catch((error: unknown) => {
          assertError(error)

          if (error.message.includes('foreign')) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Reference to meal do not exist',
              cause: error,
            })
          }

          throw error
        })

      return updatedOrder
    }
  )
