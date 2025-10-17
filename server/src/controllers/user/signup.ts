import { userSchema, type UserPublic } from '@server/entities/user'
import { publicProcedure } from '@server/trpc'
import { TRPCError } from '@trpc/server'
import { assertError } from '@server/utils/errors'

// remove roleId from input and adjust the tests
export default publicProcedure
  .input(
    userSchema.pick({
      email: true,
      password: true,
      name: true,
      roleId: true,
    })
  )
  .mutation(
    async ({ input: user, ctx: { authService } }): Promise<UserPublic> => {
      let newUser: UserPublic

      try {
        newUser = await authService.signup(
          user.email,
          user.name,
          user.password,
          user.roleId
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
