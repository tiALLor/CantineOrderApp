import { userSchemaWithRoleName, type UserPublic } from '@server/entities/user'
import { roleRepository } from '@server/repositories/roleRepository'
import { adminAuthProcedure } from '@server/trpc/adminAuthProcedure'
import provideRepos from '@server/trpc/provideRepos'
import { TRPCError } from '@trpc/server'
import { assertError } from '@server/utils/errors'

export default adminAuthProcedure
  .use(provideRepos({ roleRepository }))
  .input(
    userSchemaWithRoleName.pick({
      email: true,
      password: true,
      name: true,
      roleName: true,
    })
  )
  .mutation(
    async ({
      input: user,
      ctx: { authService, repos },
    }): Promise<UserPublic> => {
      const roleId = await repos.roleRepository.getRoleIdByName(user.roleName)

      if (!roleId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Incorrect roleName. Please try again.',
        })
      }

      let newUser: UserPublic

      try {
        newUser = await authService.signup(
          user.email,
          user.name,
          user.password,
          roleId.id
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
