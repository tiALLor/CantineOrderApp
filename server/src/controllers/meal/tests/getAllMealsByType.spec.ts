import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { insertAll } from '@tests/utils/records'
import { fakeMeal, fakeUser } from '@server/entities/tests/fakes'
import { authContext } from '@tests/utils/context'
import { authUserSchemaWithRoleName } from '@server/entities/user'
import mealRouter from '@server/controllers/meal'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealRouter)

const [userOne] = await insertAll(db, 'user', [fakeUser({ roleId: 2 })])

const [mealOne] = await insertAll(db, 'meal', [
  fakeMeal({ type: 'main' }),
  fakeMeal({ type: 'soup' }),
])

const { getAllMealsByType } = createCaller(
  authContext(
    { db },
    authUserSchemaWithRoleName.parse({ ...userOne, roleName: 'chef' })
  )
)

it('should return a list of all meals with selected type', async () => {
  const meals = await getAllMealsByType('main')

  expect(meals).toHaveLength(1)
  expect(meals).toEqual(expect.arrayContaining([mealOne]))
})
