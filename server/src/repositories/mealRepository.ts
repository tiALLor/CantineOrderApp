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

    async getAllMealsByType(type: string): Promise<MealPublic[] | []> {
      const meals = await db
        .selectFrom('meal')
        .where('type', '=', type)
        .select(mealKeyPublic)
        .execute()

      return meals
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
  }
}

export type MealRepository = ReturnType<typeof mealRepository>
