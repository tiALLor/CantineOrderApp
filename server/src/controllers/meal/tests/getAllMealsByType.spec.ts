import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { insertAll, clearTables } from '@tests/utils/records'
import { fakeMeal, fakeUser } from '@server/entities/tests/fakes'
import { authContext } from '@tests/utils/context'
import { authUserSchemaWithRoleName } from '@server/entities/user'
import mealRouter from '@server/controllers/meal'
import type { AuthService } from '@server/services/authService'

const db = await wrapInRollbacks(createTestDatabase())

const authService = {} as AuthService

const createCaller = createCallerFactory(mealRouter)

clearTables(db, ['meal'])

const [userOne] = await insertAll(db, 'user', [fakeUser({ roleId: 3 })])

const [mealOne, mealTwo] = await insertAll(db, 'meal', [
  fakeMeal({ type: 'main' }),
  fakeMeal({ type: 'soup' }),
])

const { getAllMealsByType } = createCaller(
  authContext(
    { db, authService },
    authUserSchemaWithRoleName.parse({ ...userOne, roleName: 'chef' })
  )
)

const page = 1
const pageSize = 10

it('should return a list of all meals with selected type', async () => {
  const { meals, totalPages } = await getAllMealsByType({
    type: 'main',
    page,
    pageSize,
  })

  // expect(meals).toHaveLength(1)
  expect(meals).toEqual(expect.arrayContaining([mealOne]))
  expect(meals).toEqual(expect.not.arrayContaining([mealTwo]))

  expect(totalPages).toEqual(1)
})

it('should throw a error if page is provided but pageSize is missing', async () => {
  await expect(getAllMealsByType({
    type: 'main',
    page,
  })).rejects.toThrow(/pageSize/i)

})
