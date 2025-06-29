import { createTestDatabase } from '@tests/utils/database'
import { fakeUser } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import type { AuthUserWithRoleName } from '@server/entities/user'
import { createCallerFactory, router } from '..'
import { adminAuthProcedure } from '.'

const routes = router({
  testCall: adminAuthProcedure.query(() => 'passed'),
})

const db = await wrapInRollbacks(createTestDatabase())
const [userGeneral, userChef, userAdmin] = await insertAll(db, 'user', [
  fakeUser(),
  fakeUser({ roleId: 2 }),
  fakeUser({ roleId: 1 }),
])

const createCaller = createCallerFactory(routes)
const VALID_TOKEN = 'valid-token'

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: (token: string) => {
      if (token !== VALID_TOKEN) throw new Error('Invalid token')

      return {
        user: { id: userAdmin.id, name: userAdmin.name, roleName: 'admin' },
      }
    },
  },
}))

it('should pass if the user role is admin', async () => {
  const authUserRoleIsValid = createCaller({
    db,
    authUser: {
      id: userAdmin.id,
      roleName: 'admin',
      name: userAdmin.name,
    } as AuthUserWithRoleName,
  })

  const response = await authUserRoleIsValid.testCall()

  expect(response).toEqual('passed')
})

it('should pass if user provides a valid token', async () => {
  const usingValidToken = createCaller({
    db,
    req: {
      header: () => `Bearer ${VALID_TOKEN}`,
    } as any,
  })

  const response = await usingValidToken.testCall()

  expect(response).toEqual('passed')
})

it('should throw an error if the user role is user', async () => {
  const authUserRoleIsInvalid = createCaller({
    db,
    authUser: {
      id: userGeneral.id,
      roleName: 'user',
      name: userGeneral.name,
    } as AuthUserWithRoleName,
  })

  await expect(authUserRoleIsInvalid.testCall()).rejects.toThrow(/role/i)
})

it('should throw an error if the user role is chef', async () => {
  const authUserRoleIsInvalid = createCaller({
    db,
    authUser: {
      id: userChef.id,
      roleName: 'chef',
      name: userChef.name,
    } as AuthUserWithRoleName,
  })

  await expect(authUserRoleIsInvalid.testCall()).rejects.toThrow(/role/i)
})

it('should throw an error if the authUser is undefined', async () => {
  const authUserIsUndefined = createCaller({
    db,
    req: {
      header: () => undefined,
    } as any,
    authUser: undefined,
  })

  await expect(authUserIsUndefined.testCall()).rejects.toThrow(
    /login|log in|logged in|authenticate|unauthorized/i
  )
})

it('should throw an error if the userId do not exist', async () => {
  const authUserRoleIsInvalid = createCaller({
    db,
    authUser: {
      id: 999999,
      roleName: 'user',
      name: userGeneral.name,
    } as AuthUserWithRoleName,
  })
  await expect(authUserRoleIsInvalid.testCall()).rejects.toThrow(/user/i)
})

it('should throw an error if authUser Role do not match db role', async () => {
  const authUserRoleIsInvalid = createCaller({
    db,
    authUser: {
      id: userAdmin.id,
      roleName: 'user',
      name: userAdmin.name,
    } as AuthUserWithRoleName,
  })

  await expect(authUserRoleIsInvalid.testCall()).rejects.toThrow(/user/i)
})
