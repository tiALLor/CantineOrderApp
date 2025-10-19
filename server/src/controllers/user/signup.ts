import { userSchema, type UserPublic } from '@server/entities/user'
import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import { assertError } from '@server/utils/errors'

export default publicProcedure
  .input(
    userSchema.pick({
      email: true,
      password: true,
      name: true,
    })
  )
  .mutation(
    async ({ input: user, ctx: { authService } }): Promise<UserPublic> => {
      let newUser: UserPublic

      const userRoleId = 3

      try {
        newUser = await authService.signup(
          user.email,
          user.name,
          user.password,
          userRoleId
        )
      } catch (error) {
        assertError(error)
        if (error instanceof TRPCError) {
          throw error
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'User signup failed',
          cause: error,
        })
      }

      return newUser
    }
  )
