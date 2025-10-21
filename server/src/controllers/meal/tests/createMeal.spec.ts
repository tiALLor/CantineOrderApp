import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { selectAll, insertAll, clearTables } from '@tests/utils/records'
import { fakeMeal, fakeUser } from '@server/entities/tests/fakes'
import { authContext } from '@tests/utils/context'
import { authUserSchemaWithRoleName } from '@server/entities/user'
import mealRouter from '@server/controllers/meal'
import type { MealInsertable } from '@server/entities/meal'
import type { AuthService } from '@server/services/authService'

export const db = await wrapInRollbacks(createTestDatabase())
const authService = {} as AuthService

const createCaller = createCallerFactory(mealRouter)

await clearTables(db, ['meal'])
const [userOne] = await insertAll(db, 'user', [fakeUser({ roleId: 2 })])

const { createMeal } = createCaller(
  authContext(
    { db, authService },
    authUserSchemaWithRoleName.parse({ ...userOne, roleName: 'chef' })
  )
)

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

it('should throw a error if meal name already exist', async () => {
  const [mealInDatabase] = await insertAll(db, 'meal', fakeMeal())

  const mealData: MealInsertable = {
    name: mealInDatabase.name,
    priceEur: '90.2',
    type: 'main',
  }

  await expect(createMeal(mealData)).rejects.toThrow(
    /meal with this name already exists/i
  )
})

it('should throw a error if meal name already exist with spaces', async () => {
  const [mealInDatabase] = await insertAll(db, 'meal', fakeMeal())

  const mealData: MealInsertable = {
    name: ` ${mealInDatabase.name} `,
    priceEur: '90.2',
    type: 'main',
  }

  await expect(createMeal(mealData)).rejects.toThrow(
    /meal with this name already exists/i
  )
})

it('should throw a error if meal name already exist with UpperCase', async () => {
  const [mealInDatabase] = await insertAll(db, 'meal', fakeMeal())

  const mealData: MealInsertable = {
    name: mealInDatabase.name.toUpperCase(),
    priceEur: '90.2',
    type: 'main',
  }

  await expect(createMeal(mealData)).rejects.toThrow(
    /meal with this name already exists/i
  )
})
