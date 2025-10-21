import type { Database, Meal } from '@server/database'
import type { Insertable } from 'kysely'
import {
  mealKeyPublic,
  type MealPublic,
  type MealUpdateable,
} from '../entities/meal'

export function mealRepository(db: Database) {
  return {
    async create(meal: Insertable<Meal>): Promise<MealPublic> {
      return db
        .insertInto('meal')
        .values(meal)
        .returning(mealKeyPublic)
        .executeTakeFirstOrThrow()
    },

    async getAllMeals(): Promise<MealPublic[] | []> {
      const meals = await db.selectFrom('meal').select(mealKeyPublic).execute()

      return meals
    },

    async getAllMealsByType(
      type: string,
      page?: number,
      pageSize?: number
    ): Promise<{ meals: MealPublic[]; totalPages: number }> {
      // Base query for filtering by type
      const baseQuery = db.selectFrom('meal').where('type', '=', type)

      const { records: totalRecords } = await baseQuery
        .select((eb) => [eb.fn.count<number>('meal.id').as('records')])
        .executeTakeFirstOrThrow()

      // if no records return early
      if (totalRecords === 0) return { meals: [], totalPages: 1 }

      const totalPages: number = pageSize
        ? Math.ceil(totalRecords / pageSize)
        : 1

      let mealsQuery = baseQuery.select(mealKeyPublic).orderBy('meal.name')

      if (page && pageSize) {
        mealsQuery = mealsQuery.limit(pageSize).offset((page - 1) * pageSize)
      }

      const meals = await mealsQuery.execute()

      return { meals, totalPages }
    },

    async getMealById(id: number): Promise<MealPublic | undefined> {
      return db
        .selectFrom('meal')
        .where('id', '=', id)
        .select(mealKeyPublic)
        .executeTakeFirst()
    },

    async updateMeal(
      id: number,
      record: MealUpdateable
    ): Promise<MealPublic | undefined> {
      if (Object.keys(record).length === 0) {
        return this.getMealById(id)
      }
      const meal = await db
        .updateTable('meal')
        .where('id', '=', id)
        .set(record)
        .returning(mealKeyPublic)
        .executeTakeFirst()

      if (!meal) return undefined

      return meal
    },

    async deleteMealById(id: number): Promise<MealPublic | undefined> {
      return db
        .deleteFrom('meal')
        .where('id', '=', id)
        .returning(mealKeyPublic)
        .executeTakeFirst()
    },

    async mealExists(
      mealName: string,
      excludedMealId?: number
    ): Promise<boolean> {
      let query = db
        .selectFrom('meal')
        .where('meal.name', 'ilike', mealName)

        .select('meal.id')
        .limit(1)

      if (excludedMealId) {
        query = query.where('meal.id', '!=', excludedMealId)
      }

      const foundMeal = await query.execute()
      return foundMeal.length > 0
    },
  }
}

export type MealRepository = ReturnType<typeof mealRepository>
