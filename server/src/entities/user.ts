import { z } from 'zod'
import type { Insertable, Selectable } from 'kysely'
import type { User } from '@server/database/types'
import { ROLES } from './role'
import { idSchema, passwordSchema } from './shared'

const pattern = /^[a-zA-Z][a-zA-Z0-9 _. -]{2,49}$/

// ===========================================
// main schema
// ===========================================
export const userSchema = z.object({
  id: idSchema,
  name: z
    .string()
    .trim()
    .min(3, { message: 'Username must be at least 3 characters' })
    .max(50, { message: 'Username must be at most 50 characters' })
    .regex(pattern, {
      message:
        'Must start with a letter and contain only letters, numbers, spaces, underscores, dots, or hyphens',
    }),
  email: z.string().toLowerCase().trim().email(),
  password: passwordSchema,
  roleId: z.number().positive().max(ROLES.length),
})

export const userKeyAll = Object.keys(userSchema.shape) as (keyof User)[]

// ===========================================
// insertable
// ===========================================
export const userInsertable = userSchema.pick({
  name: true,
  email: true,
  password: true,
  roleId: true,
})

export type UserInsertable = Insertable<User>

// ===========================================
// updateable
// ===========================================
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(8).max(64),
    newPassword: z.string().min(8).max(64),
    confirmNewPassword: z.string().min(8).max(64),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Passwords do not match',
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// ===========================================
// public
// ===========================================
export const userKeyPublic = ['id', 'name'] as const

export type UserPublic = Pick<Selectable<User>, (typeof userKeyPublic)[number]>

// ===========================================
// user with Role name
// ===========================================
export const userSchemaWithRoleName = userSchema.extend({
  roleName: z.enum(ROLES),
})

export type UserWithRoleName = z.infer<typeof userSchemaWithRoleName>

// ===========================================
// authUser
// ===========================================
export const authUserSchemaWithRoleName = userSchemaWithRoleName.pick({
  id: true,
  name: true,
  roleName: true,
})

export type AuthUserWithRoleName = z.infer<typeof authUserSchemaWithRoleName>

// ===========================================
// loginSchema
// ===========================================

export const loginSchema = z.object({
  email: z.string().toLowerCase().trim().email(),
  password: z.string().trim().min(1),
})

export type LoginData = z.infer<typeof loginSchema>
