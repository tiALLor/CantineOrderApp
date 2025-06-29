import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { Meal } from '../database/types'
import { idSchema } from './shared'

const MEAL_TYPES = ['soup', 'main'] as const

export const mealSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1).max(100),
  priceEur: z.coerce.string().refine((val) => {
    const num = Number(val)
    return !Number.isNaN(num) && num > 0
  }),
  type: z.enum(MEAL_TYPES),
})

export const mealAllKeys = Object.keys(mealSchema.shape) as (keyof Meal)[]

export const mealInsertable = mealSchema.pick({
  name: true,
  priceEur: true,
  type: true,
})

export const mealKeysPublic = mealAllKeys

export type MealPublic = Pick<Selectable<Meal>, (typeof mealKeysPublic)[number]>
