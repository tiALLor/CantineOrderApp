import { orderRepository } from '@server/repositories/orderRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { orderUpdateableSchema, type OrderPublic } from '@server/entities/order'
import { TRPCError } from '@trpc/server'
import { assertError } from '@server/utils/errors'

export default authenticatedProcedure
  .use(provideRepos({ orderRepository }))
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

      const updatedOrder = await repos.orderRepository
        .updateOrder(authUser.id, updateData.date, updateData)
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
