import { createCallerFactory } from '@server/trpc'
import { fakeAuthUserWithRoleName } from '@server/entities/tests/fakes'
import { authContext } from '@tests/utils/context'
import {
  authUserSchemaWithRoleName,
  type UserPublic,
} from '@server/entities/user'
import userRouter from '@server/controllers/user'
import { AuthService } from '@server/services/authService'
import { TRPCError } from '@trpc/server'

// we do not need a database for this test
const db = {} as any
const createCaller = createCallerFactory(userRouter)

const PASSWORD_CORRECT = 'Password.098'

const fakeTestUser = fakeAuthUserWithRoleName({
  id: 22,
  password: PASSWORD_CORRECT,
})

const fakeAuthService = {
  changePassword: (
    userId: number,
    oldPassword: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    newPassword: string
  ): UserPublic => {
    if (userId !== fakeTestUser.id)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    if (oldPassword !== PASSWORD_CORRECT)
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Old password is incorrect',
      })
    return { id: fakeTestUser.id, name: fakeTestUser.name }
  },
} as unknown as AuthService

let { changePassword } = createCaller(
  authContext(
    { db, authService: fakeAuthService },
    authUserSchemaWithRoleName.parse({ ...fakeTestUser })
  )
)

it('should allow to change users password', async () => {
  const data = {
    oldPassword: PASSWORD_CORRECT,
    newPassword: 'newPassword.123',
    confirmNewPassword: 'newPassword.123',
  }

  const result = await changePassword(data)

  expect(result).toEqual({
    id: fakeTestUser.id,
    name: fakeTestUser.name,
  })
})

it('should throw a error if old password do not match authUser', async () => {
  const data = {
    oldPassword: 'Some_password',
    newPassword: 'newPassword.123',
    confirmNewPassword: 'newPassword.123',
  }

  await expect(changePassword(data)).rejects.toThrow(/password/i)
})

it('should throw a error if confirmNewPassword do not match', async () => {
  const data = {
    oldPassword: PASSWORD_CORRECT,
    newPassword: 'newPassword.123',
    confirmNewPassword: 'newPassword.123456',
  }

  await expect(changePassword(data)).rejects.toThrow(/passwords do not match/i)
})

it('should throw a error for a short password', async () => {
  const data = {
    oldPassword: PASSWORD_CORRECT,
    newPassword: '123',
    confirmNewPassword: '123',
  }

  await expect(changePassword(data)).rejects.toThrow(/password/i)
})

it('should throw a error if user not exist', async () => {
  changePassword = createCaller(
    authContext(
      { db, authService: fakeAuthService },
      authUserSchemaWithRoleName.parse({
        ...fakeAuthUserWithRoleName({ id: 9999 }),
      })
    )
  ).changePassword

  const data = {
    oldPassword: PASSWORD_CORRECT,
    newPassword: 'newPassword.123',
    confirmNewPassword: 'newPassword.123',
  }

  await expect(changePassword(data)).rejects.toThrow(/User not found/i)
})
