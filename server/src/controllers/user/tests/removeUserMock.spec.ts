import { createCallerFactory } from '@server/trpc'
import { fakeAuthUserWithRoleName } from '@server/entities/tests/fakes'
import { authContext } from '@tests/utils/context'
import { authUserSchemaWithRoleName } from '@server/entities/user'
import userRouter from '@server/controllers/user'
import { AuthService } from '@server/services/authService'
import { TRPCError } from '@trpc/server'

// we do not need a database for this test
const db = {} as any

const createCaller = createCallerFactory(userRouter)

const PASSWORD_CORRECT = 'Password.098'

const fakeTestUser = fakeAuthUserWithRoleName({ id: 22, password: PASSWORD_CORRECT })

const fakeAuthService = {
  removeUser: (userId: number, password: string) => {
    if (userId !== fakeTestUser.id)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    if (password !== PASSWORD_CORRECT)
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Password is incorrect',
      })
    return { id: fakeTestUser.id, userName: fakeTestUser.name }
  },
} as unknown as AuthService

const { removeUser } = createCaller(
  authContext(
    { db, authService: fakeAuthService },
    authUserSchemaWithRoleName.parse({ ...fakeTestUser })
  )
)

it('should allow user to delete the user', async () => {
  const data = {
    password: PASSWORD_CORRECT,
  }

  const result = await removeUser(data)

  expect(result).toEqual({
    id: fakeTestUser.id,
    userName: fakeTestUser.name,
  })
})

it('should throw a error if password do not match authUser', async () => {
  const data = {
    password: 'some_password',
  }

  await expect(removeUser(data)).rejects.toThrow(/password/i)
})
