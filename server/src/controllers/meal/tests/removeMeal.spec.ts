import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { selectAll, insertAll } from '@tests/utils/records'
import { fakeUser, fakeMeal } from '@server/entities/tests/fakes'
import { authContext } from '@tests/utils/context'
import { authUserSchemaWithRoleName } from '@server/entities/user'
import mealRouter from '@server/controllers/meal'

const db = await wrapInRollbacks(createTestDatabase())
const createCaller = createCallerFactory(mealRouter)

const [userOne] = await insertAll(db, 'user', [fakeUser({ roleId: 2 })])

const [mealOne] = await insertAll(db, 'meal', [
  fakeMeal({ type: 'main' }),
  fakeMeal({ type: 'soup' }),
])

const { removeMeal } = createCaller(
  authContext(
    { db },
    authUserSchemaWithRoleName.parse({ ...userOne, roleName: 'chef' })
  )
)

it('should remove meal', async () => {
  // const mealData = fakeMeal()

  const result = await removeMeal(mealOne.id)

  expect(result).toEqual({ id: mealOne.id })

  const [mealInDatabase] = await selectAll(db, 'meal', (eb) =>
    eb('id', '=', mealOne.id)
  )

  expect(mealInDatabase).toBeUndefined()
})

it('should throw a error if meal id not found', async () => {
  // const mealData = fakeMeal()

  await expect(removeMeal(99999)).rejects.toThrow(/not_found/i)
})
