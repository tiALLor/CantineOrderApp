import { TRPCError } from '@trpc/server'
import type { Role } from '@server/entities/role'
import { authenticatedProcedure } from '../authenticatedProcedure'
import provideRepos from '../provideRepos'
import { userRepository } from '../../repositories/userRepository'

export const adminAuthProcedure = authenticatedProcedure
  .use(provideRepos({ userRepository }))
  .use(async ({ ctx: { authUser, repos }, next }) => {
    const user = await repos.userRepository.getByIdWithRoleName(authUser.id)

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User with given Id has not role',
      })
    }

    const role: Role | undefined = user?.roleName

    if (role !== 'admin') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Logged user does not have role "chef"',
      })
    }

    if (role !== authUser.roleName) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Logged user role do not match role from db',
      })
    }

    return next()
  })
