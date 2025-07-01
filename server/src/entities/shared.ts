import { z } from 'zod'

export const idSchema = z.number().int().positive()
export const dateSchema = z.coerce.date()

