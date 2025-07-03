import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { selectAll, insertAll } from '@tests/utils/records'
import { fakeUser, fakeMeal, fakeMenu } from '@server/entities/tests/fakes'
import { authContext } from '@tests/utils/context'
import { authUserSchemaWithRoleName } from '@server/entities/user'
import orderRouter from '@server/controllers/order'
import { addDays, format } from 'date-fns'

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

const dateAsString = format(addDays(new Date(), 1), 'yyyy-MM-dd')
const validDate = new Date(dateAsString)
const anotherDateAsString = format(addDays(new Date(), 2), 'yyyy-MM-dd')
const anotherValidDate = new Date(anotherDateAsString)

await insertAll(db, 'menu', [
  fakeMenu({ date: validDate, mealId: mealOne.id }),
  fakeMenu({ date: validDate, mealId: mealTwo.id }),
  fakeMenu({ date: anotherValidDate, mealId: mealTree.id }),
  fakeMenu({ date: anotherValidDate, mealId: mealFour.id }),
  fakeMenu({ date: anotherValidDate, mealId: mealTwo.id }),
])

const { createOrderForMenu } = createCaller(
  authContext(
    { db },
    authUserSchemaWithRoleName.parse({ ...userOne, roleName: 'user' })
  )
)

it('should create a menu order', async () => {
  const record = {
    date: validDate,
    userId: userOne.id,
    soupMealId: mealOne.id,
    mainMealId: mealTwo.id,
  }

  const orderForMenu = await createOrderForMenu(record)

  expect(orderForMenu).toEqual({
    ...record,
    id: expect.any(Number),
    date: dateAsString,
  })

  const [orderForMenuInDatabase] = await selectAll(db, 'order', (eb) =>
    eb('id', '=', orderForMenu.id)
  )
  expect(orderForMenuInDatabase).toEqual(orderForMenu)
})
