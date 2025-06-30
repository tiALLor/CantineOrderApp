import type { Database, Menu } from '@server/database'
import {
  menuKeyAll,
  menuKeyPublic,
  type MenuGetSchemaTypeDates,
  type MenuPublic,
  type MenuWithMeal,
} from '@server/entities/menu'
import { prefixTable } from '@server/utils/strings'
import type { Insertable } from 'kysely'

export function menuRepository(db: Database) {
  return {
    async createMenuMeal(menu: Insertable<Menu>): Promise<MenuPublic> {
      return db
        .insertInto('menu')
        .values(menu)
        .returning(menuKeyAll)
        .executeTakeFirstOrThrow()
    },

    async getMenuByDate(date: Date): Promise<MenuWithMeal[]> {
      const menus = await db
        .selectFrom('menu')
        .innerJoin('meal', 'menu.mealId', 'meal.id')
        .where('date', '=', date)
        .select([
          ...prefixTable('menu', menuKeyPublic),
          'meal.name',
          'meal.priceEur',
          'meal.type',
        ])
        .execute()

      return menus as MenuWithMeal[]
    },

    async menuMealExists({
      date,
      mealId,
    }: {
      date: Date
      mealId: number
    }): Promise<boolean> {
      const exist = await db
        .selectFrom('menu')
        .selectAll()
        .where('date', '=', date)
        .where('mealId', '=', mealId)
        .executeTakeFirst()

      return !!exist
    },

    async getMenuByTypeByDate(
      record: MenuGetSchemaTypeDates
    ): Promise<MenuWithMeal[]> {
      const menus = await db
        .selectFrom('menu')
        .innerJoin('meal', 'menu.mealId', 'meal.id')
        .select([
          ...prefixTable('menu', menuKeyPublic),
          'meal.name',
          'meal.priceEur',
          'meal.type',
        ])
        .where('menu.date', 'in', record.dates)
        .where('meal.type', '=', record.type)
        .execute()

      if (!menus) return []

      return menus as MenuWithMeal[]
    },

    async deleteMenuMealById(id: number): Promise<MenuPublic | undefined> {
      return db
        .deleteFrom('menu')
        .returning(menuKeyPublic)
        .where('id', '=', id)
        .executeTakeFirst()
    },
  }
}
