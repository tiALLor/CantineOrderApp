import { z } from 'zod'
import type { Selectable, Updateable } from 'kysely'
import type { Meal } from '@server/database/types'
import { idSchema } from './shared'

const MEAL_TYPES = ['soup', 'main'] as const

export const mealTypeSchema = z.enum(MEAL_TYPES)

export type MealType = z.infer<typeof mealTypeSchema>

export const mealSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1).max(100),
  priceEur: z.coerce.string().refine((val) => {
    const num = Number(val)
    return !Number.isNaN(num) && num > 0
  }),
  type: z.enum(MEAL_TYPES),
})

export const mealKeyAll = Object.keys(mealSchema.shape) as (keyof Meal)[]

export const mealInsertableSchema = mealSchema.pick({
  name: true,
  priceEur: true,
  type: true,
})

export type MealInsertable = z.infer<typeof mealInsertableSchema>

export const mealKeyPublic = mealKeyAll

export type MealPublic = Pick<Selectable<Meal>, (typeof mealKeyPublic)[number]>

export const mealUpdateableSchema = mealInsertableSchema.partial()

export type MealUpdateable = Pick<
  Updateable<Meal>,
  (typeof mealKeyPublic)[number]
>
