import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { selectAll, insertAll } from '@tests/utils/records'
import { fakeUser, fakeMeal } from '@server/entities/tests/fakes'
import { authContext } from '@tests/utils/context'
import { authUserSchemaWithRoleName } from '@server/entities/user'
import mealRouter from '@server/controllers/meal'
import type { AuthService } from '@server/services/authService'

const db = await wrapInRollbacks(createTestDatabase())

const authService = {} as AuthService

const createCaller = createCallerFactory(mealRouter)

const [userOne] = await insertAll(db, 'user', [fakeUser({ roleId: 2 })])

const [mealOne] = await insertAll(db, 'meal', [
  fakeMeal({ type: 'main' }),
  fakeMeal({ type: 'soup' }),
])

const { updateMeal } = createCaller(
  authContext(
    { db, authService },
    authUserSchemaWithRoleName.parse({ ...userOne, roleName: 'chef' })
  )
)

it('should update a meal', async () => {
  // const mealData = fakeMeal()

  const mealData = {
    name: 'new name',
    priceEur: '90.2',
  }

  const newMeal = await updateMeal({ id: mealOne.id, mealData })

  expect(newMeal).toEqual({ ...mealOne, ...mealData })

  const [mealInDatabase] = await selectAll(db, 'meal', (eb) =>
    eb('id', '=', mealOne.id)
  )

  expect(mealInDatabase.name).toEqual('new name')
})

it('should throw a error if meal id not found', async () => {
  // const mealData = fakeMeal()

  const mealData = {
    name: 'new name',
    priceEur: '90.2',
  }

  await expect(updateMeal({ id: 99999, mealData })).rejects.toThrow(
    /not_found/i
  )
})
