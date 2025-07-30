import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { insertAll } from '@tests/utils/records'
import { fakeUser, fakeMeal, fakeMenu } from '@server/entities/tests/fakes'
import { authContext } from '@tests/utils/context'
import { authUserSchemaWithRoleName } from '@server/entities/user'
import orderRouter from '@server/controllers/order'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(orderRouter)

const [userOne] = await insertAll(db, 'user', [
  fakeUser({ name: 'Alice', roleId: 3 }),
])

const [mealOne, mealTwo, mealTree, mealFour] = await insertAll(db, 'meal', [
  fakeMeal({ type: 'soup', priceEur: 1 }),
  fakeMeal({ type: 'main', priceEur: 1 }),
  fakeMeal({ type: 'main', priceEur: 1 }),
  fakeMeal({ type: 'soup', priceEur: 1 }),
])

const dateAsString = '2025-05-02'
const validDate = new Date(dateAsString)
const anotherDateAsString = '2025-05-03'
const anotherValidDate = new Date(anotherDateAsString)

await insertAll(db, 'menu', [
  fakeMenu({ date: validDate, mealId: mealOne.id }),
  fakeMenu({ date: validDate, mealId: mealTwo.id }),
  fakeMenu({ date: anotherValidDate, mealId: mealTree.id }),
  fakeMenu({ date: anotherValidDate, mealId: mealFour.id }),
  fakeMenu({ date: anotherValidDate, mealId: mealTwo.id }),
])

const { getMonthlyCosts } = createCaller(
  authContext(
    { db },
    authUserSchemaWithRoleName.parse({ ...userOne, roleName: 'user' })
  )
)

it('get users monthly cost summary', async () => {
  await insertAll(db, 'order', [
    {
      date: validDate,
      userId: userOne.id,
      soupMealId: mealOne.id,
      mainMealId: mealTwo.id,
    },
    {
      date: anotherValidDate,
      userId: userOne.id,
      soupMealId: mealTree.id,
      mainMealId: mealFour.id,
    },
  ])

  const summary = await getMonthlyCosts({
    year: 2025,
    month: 5,
  })

  expect(summary).toEqual({
    priceEur: '4',
  })
})

it('get users monthly cost summary', async () => {
  await expect(
    getMonthlyCosts({
      year: 2025,
      month: 13,
    })
  ).rejects.toThrow(/month/i)
})
