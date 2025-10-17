import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { createCallerFactory } from '@server/trpc'
import { insertAll } from '@tests/utils/records'
import { fakeMeal, fakeMenu } from '@server/entities/tests/fakes'
import menuRouter from '@server/controllers/menu'
import { omit } from 'lodash-es'
import type { AuthService } from '@server/services/authService'

const db = await wrapInRollbacks(createTestDatabase())

const authService = {} as AuthService

const createCaller = createCallerFactory(menuRouter)

// const [userOne] = await insertAll(db, 'user', [fakeUser({ roleId: 3 })])

const [mealOne, mealTwo, mealTree, mealFour] = await insertAll(db, 'meal', [
  fakeMeal({ type: 'soup' }),
  fakeMeal({ type: 'main' }),
  fakeMeal({ type: 'main' }),
  fakeMeal({ type: 'soup' }),
])

await insertAll(db, 'menu', [
  fakeMenu({ date: new Date('2025-03-23'), mealId: mealOne.id }),
  fakeMenu({ date: new Date('2025-03-23'), mealId: mealTwo.id }),
  fakeMenu({ date: new Date('2025-03-23'), mealId: mealTree.id }),
  fakeMenu({ date: new Date('2025-03-24'), mealId: mealFour.id }),
  fakeMenu({ date: new Date('2025-03-24'), mealId: mealTwo.id }),
])

const { getMenuByTypeDates } = createCaller({ db, authService })

it('should return a list of menu for selected day and meal type', async () => {
  const menu = await getMenuByTypeDates({
    type: 'main',
    dates: [new Date('2025-03-23'), new Date('2025-03-24')],
  })

  expect(menu['2025-03-23']).toEqual(
    expect.arrayContaining([
      {
        ...fakeMenu({
          date: new Date('2025-03-23'),
          mealId: mealTwo.id,
          id: expect.any(Number),
          ...omit(mealTwo, ['id']),
        }),
      },
      {
        ...fakeMenu({
          date: new Date('2025-03-23'),
          mealId: mealTree.id,
          id: expect.any(Number),
          ...omit(mealTree, ['id']),
        }),
      },
    ])
  )

  expect(menu['2025-03-24']).toEqual(
    expect.arrayContaining([
      {
        ...fakeMenu({
          date: new Date('2025-03-24'),
          mealId: mealTwo.id,
          id: expect.any(Number),
          ...omit(mealTwo, ['id']),
        }),
      },
    ])
  )
})

it('should return [] if not match', async () => {
  const result = await getMenuByTypeDates({
    type: 'main',
    dates: [new Date('2025-09-23')],
  })

  expect(result).toEqual({})
})
