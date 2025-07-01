import { orderRepository } from '@server/repositories/orderRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { type OrderWithUserMeal } from '@server/entities/order'
import { assertError } from '@server/utils/errors'
import { z } from 'zod'
import { dateSchema } from '@server/entities/shared'

export default authenticatedProcedure
  .use(provideRepos({ orderRepository }))
  .input(z.array(dateSchema))
  .query(
    async ({
      input: dates,
      ctx: { repos, authUser },
    }): Promise<OrderWithUserMeal[]> => {
      const monthlyCosts = await repos.orderRepository
        .getOrderByUserDates(authUser.id, dates)
        .catch((error: unknown) => {
          assertError(error)

          throw error
        })
      return monthlyCosts
    }
  )
