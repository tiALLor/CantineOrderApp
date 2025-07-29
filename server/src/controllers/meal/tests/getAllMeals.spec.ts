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

const [userOne] = await insertAll(db, 'user', [fakeUser({ roleId: 3 })])

const [mealOne, mealTwo] = await insertAll(db, 'meal', [fakeMeal(), fakeMeal()])

const { getAllMeals } = createCaller(
  authContext(
    { db },
    authUserSchemaWithRoleName.parse({ ...userOne, roleName: 'chef' })
  )
)

it('should return a list of all meals', async () => {
  const meals = await getAllMeals()

  expect(meals).toEqual(expect.arrayContaining([mealOne, mealTwo]))
})
