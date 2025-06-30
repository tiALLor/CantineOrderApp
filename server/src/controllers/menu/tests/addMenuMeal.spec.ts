import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { selectAll, insertAll } from '@tests/utils/records'
import { fakeUser, fakeMeal, fakeMenu } from '@server/entities/tests/fakes'
import { authContext } from '@tests/utils/context'
import { authUserSchemaWithRoleName } from '@server/entities/user'
import menuRouter from '@server/controllers/menu'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(menuRouter)

const [userOne] = await insertAll(db, 'user', [fakeUser({ roleId: 2 })])

const [mealOne, mealTwo, mealTree] = await insertAll(db, 'meal', [
  fakeMeal({ type: 'soup' }),
  fakeMeal({ type: 'main' }),
  fakeMeal({ type: 'main' }),
])

await insertAll(db, 'menu', [
  fakeMenu({ date: '2025-03-23', mealId: mealOne.id }),
  fakeMenu({ date: '2025-03-23', mealId: mealTwo.id }),
])

const { addMenuMeal } = createCaller(
  authContext(
    { db },
    authUserSchemaWithRoleName.parse({ ...userOne, roleName: 'chef' })
  )
)

// TODO erase if not needed
it('should do something', async () => {})

it('should create a menu meal element', async () => {
  const menuMealData = {
    date: new Date('2025-03-23'),
    mealId: mealTree.id,
  }

  const menuMeal = await addMenuMeal(menuMealData)

  expect(menuMeal).toEqual({
    ...menuMealData,
    date: '2025-03-23',
    id: expect.any(Number),
  })

  const [menuMealInDatabase] = await selectAll(db, 'menu', (eb) =>
    eb('id', '=', menuMeal.id)
  )

  expect(menuMealInDatabase).toEqual({
    ...menuMealData,
    id: expect.any(Number),
    date: '2025-03-23',
  })
})

it('should trow a error if meal exist in menu date', async () => {
  const menuMealData = {
    date: new Date('2025-03-23'),
    mealId: mealOne.id,
  }

  await expect(addMenuMeal(menuMealData)).rejects.toThrow(/meal/i)
})
