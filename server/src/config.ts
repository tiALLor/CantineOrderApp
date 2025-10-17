import 'dotenv/config'
import { z } from 'zod'
import type { Secret } from 'jsonwebtoken'
import { testUser } from './shared/forTests'

const { env } = process

if (!env.NODE_ENV) env.NODE_ENV = 'development'

// force UTC timezone, so it matches the default timezone in production
env.TZ = 'UTC'

const isTest = env.NODE_ENV === 'test'
const isDevTest = env.NODE_ENV === 'development' || isTest

const jwtExpirySchema = z.union([
  z.number(),
  z.string().regex(/^\d+(ms|s|m|h|d|w|y)$/), // e.g. "1h", "30m", "7d"
])

const schema = z
  .object({
    env: z
      .enum(['development', 'production', 'staging', 'test'])
      .default('development'),
    isCi: z.preprocess(coerceBoolean, z.boolean().default(false)),
    port: z.coerce.number().default(3000),

    auth: z.object({
      tokenKey: z
        .string()
        .default(() => {
          if (isDevTest) {
            return 'supersecretkey'
          }
          throw new Error('You must provide a TOKEN_KEY in a production env!')
        })
        .transform((val) => val as Secret), // Cast to Secret for JWT typing,
      refreshTokenKey: z
        .string()
        .default(() => {
          if (isDevTest) {
            return 'superRefreshSecretKey'
          }

          throw new Error('You must provide a TOKEN_KEY in a production env!')
        })
        .transform((val) => val as Secret), // Cast to Secret for JWT typing,
      tokenExpiresIn: jwtExpirySchema.default('1h'),
      refreshTokenExpiresIn: jwtExpirySchema.default('7d'),
      passwordCost: z.coerce.number().default(isDevTest ? 6 : 12),
      passwordPepper: z.string().default('abc123'),
    }),

    database: z.object({
      connectionString: z.string().url(),
    }),

    admin: z.object({
      email: z
        .string()
        .email()
        .toLowerCase()
        .default(() => {
          if (isDevTest) {
            return testUser.email
          }

          throw new Error('You must provide a ADMIN_EMAIL in a production env!')
        }),
      password: z
        .string()
        .min(8)
        .max(40)
        .default(() => {
          if (isDevTest) {
            return testUser.password
          }

          throw new Error(
            'You must provide a INITIAL_ADMIN_PASSWORD in a production env!'
          )
        }),
    }),
  })
  .readonly()

const config = schema.parse({
  env: env.NODE_ENV,
  port: env.PORT,
  isCi: env.CI,

  auth: {
    tokenKey: env.TOKEN_KEY,
    refreshTokenKey: env.REFRESH_TOKEN_KEY,
    tokenExpiresIn: env.TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    passwordCost: env.PASSWORD_COST,
    passwordPepper: env.PASSWORD_PEPPER,
  },

  database: {
    connectionString: env.DATABASE_URL,
  },

  admin: {
    email: env.ADMIN_EMAIL,
    password: env.INITIAL_ADMIN_PASSWORD,
  },
})

export default config

// utility functions
function coerceBoolean(value: unknown) {
  if (typeof value === 'string') {
    return value === 'true' || value === '1'
  }

  return undefined
}
