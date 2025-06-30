import { z } from 'zod'
import type { Insertable, Selectable, Updateable } from 'kysely'
import type { Menu } from '@server/database/types'
import { idSchema, dateSchema } from './shared'
import { mealSchema, mealTypeSchema } from './meal'

export const menuSchema = z.object({
  id: idSchema,
  date: dateSchema,
  mealId: idSchema,
})

export const menuKeyAll = Object.keys(menuSchema.shape) as (keyof Menu)[]

export const menuInsertableSchema = menuSchema.pick({
  date: true,
  mealId: true,
})

export type MealInsertable = Insertable<Menu>

export const menuKeyPublic = menuKeyAll

export type MenuPublic = Pick<Selectable<Menu>, (typeof menuKeyPublic)[number]>

export const menuUpdateable = menuInsertableSchema.partial()

export type MenuUpdateable = Pick<
  Updateable<Menu>,
  (typeof menuKeyPublic)[number]
>

// special cases

export const menuGetSchemaTypeDates = z.object({
  type: mealTypeSchema,
  dates: z.array(z.coerce.date()),
})

export type MenuGetSchemaTypeDates = z.infer<typeof menuGetSchemaTypeDates>

export const menuWithMealSchema = menuSchema.merge(
  mealSchema.omit({ id: true })
)

export type MenuWithMeal = z.infer<typeof menuWithMealSchema>

export type GroupedMenus = Record<string, MenuWithMeal[]>
