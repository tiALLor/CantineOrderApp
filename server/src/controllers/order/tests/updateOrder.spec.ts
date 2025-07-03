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

const [menuOne, menuTwo] = await insertAll(db, 'menu', [
  fakeMenu({ date: validDate, mealId: mealOne.id }),
  fakeMenu({ date: validDate, mealId: mealTwo.id }),
  fakeMenu({ date: anotherValidDate, mealId: mealTree.id }),
  fakeMenu({ date: anotherValidDate, mealId: mealFour.id }),
  fakeMenu({ date: anotherValidDate, mealId: mealTwo.id }),
])

const { updateOrder } = createCaller(
  authContext(
    { db },
    authUserSchemaWithRoleName.parse({ ...userOne, roleName: 'user' })
  )
)

it('should update the order', async () => {
  const [orderForMenu] = await insertAll(db, 'order', {
    date: validDate,
    userId: userOne.id,
    soupMealId: mealOne.id,
    mainMealId: mealTwo.id,
  })

  const record = {
    date: validDate,
    soupMealId: null,
    mainMealId: null,
  }

  const updatedOrder = await updateOrder(record)

  expect(updatedOrder).toEqual({
    id: orderForMenu.id,
    date: dateAsString,
    userId: userOne.id,
    soupMealId: null,
    mainMealId: null,
  })

  const [orderForMenuInDatabase] = await selectAll(db, 'order', (eb) =>
    eb('id', '=', orderForMenu.id)
  )

  expect(orderForMenuInDatabase).toEqual(updatedOrder)
})

it('should update the order partially', async () => {
  const [orderForMenu] = await insertAll(db, 'order', {
    date: validDate,
    userId: userOne.id,
    soupMealId: mealOne.id,
    mainMealId: mealTwo.id,
  })

  const record = {
    date: validDate,
    soupMealId: null,
  }

  const updatedOrder = await updateOrder(record)

  expect(updatedOrder).toEqual({
    id: orderForMenu.id,
    date: dateAsString,
    userId: userOne.id,
    soupMealId: null,
    mainMealId: mealTwo.id,
  })

  const [orderForMenuInDatabase] = await selectAll(db, 'order', (eb) =>
    eb('id', '=', orderForMenu.id)
  )

  expect(orderForMenuInDatabase).toEqual(updatedOrder)
})
