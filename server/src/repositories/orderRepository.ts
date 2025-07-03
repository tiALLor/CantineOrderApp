import type { Database } from '@server/database'
import {
  orderKeyPublic,
  type OrderPublic,
  type OrderInsertable,
  type OrderUpdateable,
  type OrderWithUserMeal,
  type OrderGetByYearMonth,
  type PriceEurSchema,
} from '@server/entities/order'
import { omit } from 'lodash-es'

export function orderRepository(db: Database) {
  return {
    async createOrderForMenu(order: OrderInsertable): Promise<OrderPublic> {
      return db
        .insertInto('order')
        .values(order)
        .returning(orderKeyPublic)
        .executeTakeFirstOrThrow()
    },

    async updateOrder(
      userId: number,
      date: Date,
      record: OrderUpdateable
    ): Promise<OrderPublic> {
      const updatedOrder = await db
        .updateTable('order')
        .where('userId', '=', userId)
        .where('date', '=', date)
        .set(omit(record, ['date']))
        .returning(orderKeyPublic)
        .executeTakeFirst()

      if (!updatedOrder) throw new Error('Order for update Not Found')

      return updatedOrder
    },

    async getOrderByUserDates(
      id: number,
      dates: Date[]
    ): Promise<OrderWithUserMeal[]> {
      const orders = await db
        .selectFrom('order')
        .innerJoin('user', 'order.userId', 'user.id')
        .leftJoin('meal as main', 'order.mainMealId', 'main.id')
        .leftJoin('meal as soup', 'order.soupMealId', 'soup.id')
        .select([
          'order.id',
          'order.userId',
          'user.name as userName',
          'order.date',
          'order.mainMealId',
          'main.name as mainMealName',
          'main.priceEur as mainMealPrice',
          'order.soupMealId',
          'soup.name as soupMealName',
          'soup.priceEur as soupMealPrice',
        ])
        .where('order.userId', '=', id)
        .where('order.date', 'in', dates)
        .orderBy('order.date', 'asc')
        .execute()

      return orders as OrderWithUserMeal[]
    },

    async getMonthlyCosts(
      id: number,
      record: OrderGetByYearMonth
    ): Promise<PriceEurSchema> {
      const from = new Date(record.year, record.month - 1, 1)
      const to = new Date(record.year, record.month, 1)

      const orders = await db
        .selectFrom('order')
        // .leftJoin('menu as main', 'order.mainMealId', 'main.id')
        .leftJoin('meal as mainMeal', 'order.mainMealId', 'mainMeal.id')
        // .leftJoin('menu as soup', 'order.soupMealId', 'soup.id')
        .leftJoin('meal as soupMeal', 'order.soupMealId', 'soupMeal.id')
        .where('order.userId', '=', id)
        .where('order.date', '>=', from)
        .where('order.date', '<', to)
        .select([
          'mainMeal.priceEur as mainPrice',
          'soupMeal.priceEur as soupPrice',
        ])
        .execute()

      const summary = orders.reduce((sum, row) => {
        const main = Number(row.mainPrice ?? 0)
        const soup = Number(row.soupPrice ?? 0)
        return sum + main + soup
      }, 0)

      return { priceEur: summary.toString() }
    },

    // async getMonthlyCosts(
    //   id: number,
    //   record: OrderGetByYearMonth
    // ): Promise<PriceEurSchema> {
    //   const from = new Date(record.year, record.month - 1, 1)
    //   const to = new Date(record.year, record.month, 1)

    //   const orders = await db
    //     .selectFrom('order')
    //     .leftJoin('menu as main', 'order.mainMealId', 'main.id')
    //     .leftJoin('meal as mainMeal', 'main.mealId', 'mainMeal.id')
    //     .leftJoin('menu as soup', 'order.soupMealId', 'soup.id')
    //     .leftJoin('meal as soupMeal', 'soup.mealId', 'soupMeal.id')
    //     .where('order.userId', '=', id)
    //     .where('order.date', '>=', from)
    //     .where('order.date', '<', to)
    //     .select([
    //       'mainMeal.priceEur as mainPrice',
    //       'soupMeal.priceEur as soupPrice',
    //     ])
    //     .execute()

    //   const summary = orders.reduce((sum, row) => {
    //     const main = Number(row.mainPrice ?? 0)
    //     const soup = Number(row.soupPrice ?? 0)
    //     return sum + main + soup
    //   }, 0)

    //   return { priceEur: summary.toString() }
    // },
  }
}

export type OrderRepository = ReturnType<typeof orderRepository>
