import { z } from 'zod'
import type { Insertable, Selectable, Updateable } from 'kysely'
import type { Order } from '@server/database/types'
import { idSchema, dateSchema } from './shared'
import { mealTypeSchema } from './meal'
import { menuSchema } from './menu'

export const orderSchema = z.object({
  id: idSchema,
  userId: idSchema,
  date: dateSchema,
  soupMealId: idSchema.nullable().default(null),
  mainMealId: idSchema.nullable().default(null),
})

export const orderKeyAll = Object.keys(orderSchema.shape) as (keyof Order)[]

export const orderInsertableSchema = orderSchema.pick({
  userId: true,
  date: true,
  soupMealId: true,
  mainMealId: true,
})

export type OrderInsertable = Insertable<Order>

export const orderKeyPublic = orderKeyAll

export type OrderPublic = Pick<
  Selectable<Order>,
  (typeof orderKeyPublic)[number]
>

export const orderUpdateable = orderInsertableSchema.partial()

export type OrderUpdateable = Pick<
  Updateable<Order>,
  (typeof orderKeyPublic)[number]
>

// special cases get by type and dates as [] search conditions
export const orderSchemaGetByTypeDates = z.object({
  type: mealTypeSchema,
  dates: z.array(z.coerce.date()),
})

export type OrderSchemaGetByTypeDates = z.infer<
  typeof orderSchemaGetByTypeDates
>

// special case get by year and month search conditions

export const orderSchemaGetByYearMonth = z.object({
  year: z.coerce.number().int().min(2000).max(2200),
  month: z.coerce.number().int().min(1).max(12),
})

export type OrderSchemaGetByYearMonth = z.infer<
  typeof orderSchemaGetByYearMonth
>

// special case returning users order with user and meal details

const orderWithUserMealSchema = orderSchema.extend({
  userName: z.string(),
  soupMealName: z.string().nullable(),
  soupMealPrice: z.number().nullable(),
  mainMealName: z.string().nullable(),
  mainMealPrice: z.number().nullable(),
})

export type OrderWithUserMealSchema = z.infer<typeof orderWithUserMealSchema>

// // special case returning meal summary orders with meal details

const orderSummaryWithMealSchema = menuSchema.extend({
  mealName: z.string(),
  quantity: z.number(),
})

export type OrderSummaryWithMealSchema = z.infer<
  typeof orderSummaryWithMealSchema
>
