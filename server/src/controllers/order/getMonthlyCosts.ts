import { orderRepository } from '@server/repositories/orderRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import {
  orderSchemaGetByYearMonth,
  type PriceEurSchema,
} from '@server/entities/order'
import { assertError } from '@server/utils/errors'

export default authenticatedProcedure
  .use(provideRepos({ orderRepository }))
  .input(orderSchemaGetByYearMonth)
  .query(
    async ({
      input: monthData,
      ctx: { repos, authUser },
    }): Promise<PriceEurSchema> => {
      const monthlyCosts = await repos.orderRepository
        .getMonthlyCosts(authUser.id, monthData)
        .catch((error: unknown) => {
          assertError(error)

          throw error
        })
      return monthlyCosts
    }
  )
