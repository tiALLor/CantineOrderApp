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

const [mealOne, mealTwo] = await insertAll(db, 'meal', [
  fakeMeal({ type: 'soup' }),
  fakeMeal({ type: 'main' }),
  fakeMeal({ type: 'main' }),
])

const [menuOne] = await insertAll(db, 'menu', [
  fakeMenu({ date: '2025-03-23', mealId: mealOne.id }),
  fakeMenu({ date: '2025-03-23', mealId: mealTwo.id }),
])

const { removeMenuMeal } = createCaller(
  authContext(
    { db },
    authUserSchemaWithRoleName.parse({ ...userOne, roleName: 'chef' })
  )
)
it('should remove meal from menu with specified day', async () => {
  // const mealData = fakeMeal()

  const result = await removeMenuMeal({ id: menuOne.id })

  expect(result).toEqual({ id: menuOne.id })

  const [menuMealInDatabase] = await selectAll(db, 'menu', (eb) =>
    eb('id', '=', menuOne.id)
  )

  expect(menuMealInDatabase).toBeUndefined()
})

it('should throw a error if meal id not found', async () => {
  // const mealData = fakeMeal()

  await expect(removeMenuMeal({ id: 99999 })).rejects.toThrow(/not_found/i)
})
