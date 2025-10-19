import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { selectAll, insertAll } from '@tests/utils/records'
import { fakeMenu, fakeMeal } from '@server/entities/tests/fakes'
import { omit } from 'lodash-es'
import { menuRepository } from '../menuRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = menuRepository(db)

await db.deleteFrom('order').execute()
await db.deleteFrom('menu').execute()
await db.deleteFrom('meal').execute()
await db.deleteFrom('user').execute()

const [mealOne, mealTwo, mealTree, mealFour] = await insertAll(db, 'meal', [
  fakeMeal({ type: 'soup' }),
  fakeMeal({ type: 'main' }),
  fakeMeal({ type: 'main' }),
  fakeMeal({ type: 'soup' }),
])

const [menuOne] = await insertAll(db, 'menu', [
  fakeMenu({ date: '2025-03-23', mealId: mealOne.id }),
  fakeMenu({ date: '2025-03-23', mealId: mealTwo.id }),
  fakeMenu({ date: '2025-03-23', mealId: mealTree.id }),
  fakeMenu({ date: '2025-03-24', mealId: mealFour.id }),
  fakeMenu({ date: '2025-03-24', mealId: mealTwo.id }),
])
describe('create a menu', () => {
  it('should create a day menu meal ', async () => {
    const record = fakeMenu({ mealId: mealOne.id, date: '2025-05-06' })

    const menuMeal = await repository.createMenuMeal(record)

    expect(menuMeal).toEqual({ ...record, id: expect.any(Number) })

    const [menuMealInDatabase] = await selectAll(db, 'menu', (eb) =>
      eb('id', '=', menuMeal.id)
    )
    expect(menuMealInDatabase).toEqual({ ...record, id: menuMeal.id })
  })
})

describe('get menu by date', () => {
  it('should get menu by date', async () => {
    const result = await repository.getMenuByDate(new Date('2025-03-23'))

    expect(result).toEqual([
      {
        ...fakeMenu({
          date: '2025-03-23',
          mealId: mealOne.id,
          id: expect.any(Number),
        }),
        ...omit(mealOne, ['id']),
      },
      {
        ...fakeMenu({
          date: '2025-03-23',
          mealId: mealTwo.id,
          id: expect.any(Number),
        }),
        ...omit(mealTwo, ['id']),
      },
      {
        ...fakeMenu({
          date: '2025-03-23',
          mealId: mealTree.id,
          id: expect.any(Number),
        }),
        ...omit(mealTree, ['id']),
      },
    ])
  })
})

describe('menuMealExists', () => {
  it('should return true if menuId exists in the date menu', async () => {
    const exists = await repository.menuMealExists({
      date: new Date('2025-03-23'),
      mealId: mealOne.id,
    })

    expect(exists).toBe(true)
  })

  it('should return false if menuId do not exist in the date menu', async () => {
    const exists = await repository.menuMealExists({
      date: new Date('2025-03-23'),
      mealId: mealFour.id,
    })

    expect(exists).toBe(false)
  })
})

describe('get menu by days and type', () => {
  it('should get menu by days and type', async () => {
    const menu = await repository.getMenuByTypeByDate({
      type: 'main',
      dates: [new Date('2025-03-23'), new Date('2025-03-24')],
    })

    expect(menu).toEqual(
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
    const result = await repository.getMenuByTypeByDate({
      type: 'main',
      dates: [new Date('2025-09-23')],
    })

    expect(result).toEqual([])
  })
})

describe('deleteMenuMeal ById', () => {
  it('should delete menu element by Id', async () => {
    const result = await repository.deleteMenuMealById(menuOne.id)

    expect(result).toEqual(menuOne)

    const [menuMealInDatabase] = await selectAll(db, 'menu', (eb) =>
      eb('id', '=', menuOne.id)
    )
    expect(menuMealInDatabase).toBeUndefined()
  })
})
