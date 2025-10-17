import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { selectAll, insertAll } from '@tests/utils/records'
import { fakeUser, fakeMeal, fakeMenu } from '@server/entities/tests/fakes'
import { authContext } from '@tests/utils/context'
import { authUserSchemaWithRoleName } from '@server/entities/user'
import mealRouter from '@server/controllers/meal'
import type { AuthService } from '@server/services/authService'

const db = await wrapInRollbacks(createTestDatabase())

const authService = {} as AuthService

const createCaller = createCallerFactory(mealRouter)

const [userOne] = await insertAll(db, 'user', [fakeUser({ roleId: 2 })])

const [mealOne, mealTwo] = await insertAll(db, 'meal', [
  fakeMeal({ type: 'main' }),
  fakeMeal({ type: 'soup' }),
])

const { removeMeal } = createCaller(
  authContext(
    { db, authService },
    authUserSchemaWithRoleName.parse({ ...userOne, roleName: 'chef' })
  )
)

it('should remove meal', async () => {
  // const mealData = fakeMeal()

  const result = await removeMeal({ id: mealOne.id })

  expect(result).toEqual({ id: mealOne.id })

  const [mealInDatabase] = await selectAll(db, 'meal', (eb) =>
    eb('id', '=', mealOne.id)
  )

  expect(mealInDatabase).toBeUndefined()
})

it('should throw a error if meal id not found', async () => {
  // const mealData = fakeMeal()

  await expect(removeMeal({ id: 99999 })).rejects.toThrow(/not_found/i)
})

it('should throw a error if meal is used in menu', async () => {
  // const mealData = fakeMeal()

  await insertAll(db, 'menu', [fakeMenu({ mealId: mealTwo.id })])

  await expect(removeMeal({ id: mealTwo.id })).rejects.toThrow(/Meal used in menu/i)
})
