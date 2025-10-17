import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { selectAll, insertAll } from '@tests/utils/records'
import { fakeUser, fakeMeal, fakeMenu } from '@server/entities/tests/fakes'
import { authContext } from '@tests/utils/context'
import { authUserSchemaWithRoleName } from '@server/entities/user'
import menuRouter from '@server/controllers/menu'
import { addDays, format } from 'date-fns'
import type { AuthService } from '@server/services/authService'

const db = await wrapInRollbacks(createTestDatabase())

const authService = {} as AuthService

const createCaller = createCallerFactory(menuRouter)

const [userOne] = await insertAll(db, 'user', [fakeUser({ roleId: 2 })])

const [mealOne, mealTwo, mealTree] = await insertAll(db, 'meal', [
  fakeMeal({ type: 'soup' }),
  fakeMeal({ type: 'main' }),
  fakeMeal({ type: 'main' }),
])

const dateAsString = format(addDays(new Date(), 1), 'yyyy-MM-dd')
const validDate = new Date(dateAsString)

await insertAll(db, 'menu', [
  fakeMenu({ date: validDate, mealId: mealOne.id }),
  fakeMenu({ date: validDate, mealId: mealTwo.id }),
])

const { addMenuMeal } = createCaller(
  authContext(
    { db, authService },
    authUserSchemaWithRoleName.parse({ ...userOne, roleName: 'chef' })
  )
)

it('should create a menu meal element', async () => {
  const menuMealData = {
    date: validDate,
    mealId: mealTree.id,
  }

  const menuMeal = await addMenuMeal(menuMealData)

  expect(menuMeal).toEqual({
    ...menuMealData,
    date: dateAsString,
    id: expect.any(Number),
  })

  const [menuMealInDatabase] = await selectAll(db, 'menu', (eb) =>
    eb('id', '=', menuMeal.id)
  )

  expect(menuMealInDatabase).toEqual({
    ...menuMealData,
    id: expect.any(Number),
    date: dateAsString,
  })
})

it('should trow a error if meal exist in menu date', async () => {
  const menuMealData = {
    date: validDate,
    mealId: mealOne.id,
  }

  await expect(addMenuMeal(menuMealData)).rejects.toThrow(/meal/i)
})

it('should trow a error if mealId do not exists ', async () => {
  const menuMealData = {
    date: validDate,
    mealId: 9999999,
  }

  await expect(addMenuMeal(menuMealData)).rejects.toThrow(/meal/i)
})

it('should trow a error if menu meal element', async () => {
  const menuMealData = {
    date: validDate,
    mealId: mealTree.id,
  }

  await addMenuMeal(menuMealData)

  await expect(addMenuMeal(menuMealData)).rejects.toThrow(/meal/i)
})

it('should trow a error if date is from past', async () => {
  const menuMealData = {
    date: new Date('2000-01-01'),
    mealId: mealTree.id,
  }

  await expect(addMenuMeal(menuMealData)).rejects.toThrow(/today or past/i)
})
