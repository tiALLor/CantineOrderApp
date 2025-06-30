import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { selectAll, insertAll } from '@tests/utils/records'
import { fakeUser } from '@server/entities/tests/fakes'
import { authContext } from '@tests/utils/context'
import { authUserSchemaWithRoleName } from '@server/entities/user'
import mealRouter from '@server/controllers/meal'
import type { MealInsertable } from '@server/entities/meal'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealRouter)

const [userOne] = await insertAll(db, 'user', [fakeUser({ roleId: 2 })])

const { createMeal } = createCaller(
  authContext(
    { db },
    authUserSchemaWithRoleName.parse({ ...userOne, roleName: 'chef' })
  )
)

// TODO erase if not needed
it('should do something', async () => {})

it('should create a meal', async () => {
  // const mealData = fakeMeal()

  const mealData: MealInsertable = {
    name: 'some name',
    priceEur: '90.2',
    type: 'main',
  }

  const meal = await createMeal(mealData)

  expect(meal).toEqual({
    ...mealData,
    id: expect.any(Number),
  })

  const [mealInDatabase] = await selectAll(db, 'meal', (eb) =>
    eb('id', '=', meal.id)
  )

  expect(mealInDatabase).toEqual({ ...mealData, id: expect.any(Number) })
})
