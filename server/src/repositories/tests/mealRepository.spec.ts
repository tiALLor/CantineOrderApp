import { createTestDatabase } from '@tests/utils/database'
import { selectAll, insertAll } from '@tests/utils/records'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { fakeMeal } from '@server/entities/tests/fakes'
import { mealRepository } from '../mealRepository'

export const db = await wrapInRollbacks(createTestDatabase())
const repository = mealRepository(db)

await db.deleteFrom('order').execute()
await db.deleteFrom('menu').execute()
await db.deleteFrom('meal').execute()
await db.deleteFrom('user').execute()

const [mealOne, mealTwo] = await insertAll(db, 'meal', [
  fakeMeal({ type: 'soup' }),
  fakeMeal({ type: 'main' }),
])

describe('create a meal', () => {
  it('should create a meal', async () => {
    const record = fakeMeal()

    const meal = await repository.create(record)

    expect(meal).toEqual({
      ...record,
      id: expect.any(Number),
    })

    const [mealInDatabase] = await selectAll(db, 'meal', (eb) =>
      eb('id', '=', meal.id)
    )
    expect(mealInDatabase).toEqual({ ...record, id: meal.id })
  })
})

describe('getAllMeals', () => {
  it('should get all meals in database', async () => {
    const meals = await repository.getAllMeals()

    expect(meals).toEqual(expect.arrayContaining([mealOne, mealTwo]))
  })
})

describe('getAllMealsByType', () => {
  it('should get all meals in database with given type', async () => {
    const { meals, totalPages } = await repository.getAllMealsByType(
      'main',
      1,
      10
    )

    expect(meals).toEqual(expect.arrayContaining([mealTwo]))
    expect(totalPages).toEqual(1)
  })

  it('should get all meals in database with given type without pagination', async () => {
    const { meals, totalPages } = await repository.getAllMealsByType('main')

    expect(meals).toEqual(expect.arrayContaining([mealTwo]))
    expect(totalPages).toEqual(1)
  })

  it('should get return { meals: [], totalPages: 1 } if no records', async () => {
    await db.deleteFrom('meal').execute()
    const { meals, totalPages } = await repository.getAllMealsByType('main')

    expect(meals).toEqual([])
    expect(totalPages).toEqual(1)
  })
})

describe('getMealById', () => {
  it('should get meal by id', async () => {
    const meal = await repository.getMealById(mealOne.id)

    expect(meal).toEqual(mealOne)
  })

  it('should return undefined if no meal with id', async () => {
    const meal = await repository.getMealById(99999)

    expect(meal).toBeUndefined()
  })
})

describe('updateMeal', () => {
  it('should update meal', async () => {
    const record = { name: 'new name' }

    const newMeal = await repository.updateMeal(mealTwo.id, record)

    expect(newMeal).toEqual({ ...mealTwo, name: 'new name' })

    const [mealInDatabase] = await selectAll(db, 'meal', (eb) =>
      eb('id', '=', mealTwo.id)
    )
    expect(mealInDatabase.name).toEqual('new name')
  })

  it('should update meal with 2 parameters', async () => {
    const record = { name: 'better name', priceEur: '9.99' }

    const newMeal = await repository.updateMeal(mealTwo.id, record)

    expect(newMeal).toEqual({ ...mealTwo, ...record })

    const [mealInDatabase] = await selectAll(db, 'meal', (eb) =>
      eb('id', '=', mealTwo.id)
    )
    expect(mealInDatabase.name).toEqual('better name')
    expect(mealInDatabase.priceEur).toEqual('9.99')
  })

  it('should return original meal if not changes are provided', async () => {
    const record = {}

    const newMeal = await repository.updateMeal(mealTwo.id, record)

    expect(newMeal).toEqual({ ...mealTwo })

    const [mealInDatabase] = await selectAll(db, 'meal', (eb) =>
      eb('id', '=', mealTwo.id)
    )
    expect(mealInDatabase).toEqual(mealTwo)
  })

  it('should return undefined if no meal with id', async () => {
    const record = { name: 'new name' }
    const meal = await repository.updateMeal(99999, record)

    expect(meal).toBeUndefined()
  })
})

describe('deleteMealById', () => {
  it('should delete meal by provided id', async () => {
    const [mealToBeDeleted] = await insertAll(db, 'meal', fakeMeal())

    const result = await repository.deleteMealById(mealToBeDeleted.id)

    expect(result).toEqual(mealToBeDeleted)

    // check directly in database
    const [mealInDatabase] = await selectAll(db, 'user', (eb) =>
      eb('id', '=', mealToBeDeleted.id)
    )
    expect(mealInDatabase).toBeUndefined()
  })

  it('should return undefined if user do not exist', async () => {
    const result = await repository.deleteMealById(99999)

    expect(result).toBeUndefined()
  })
})

describe('mealExists', () => {
  it('should find meal(return true) in the database', async () => {
    const [mealInDatabase] = await insertAll(db, 'meal', fakeMeal())

    const result = await repository.mealExists(mealInDatabase.name)

    expect(result).toEqual(true)
  })

  it('should find meal(return true) in the database if uppercase', async () => {
    const [mealInDatabase] = await insertAll(db, 'meal', fakeMeal())

    const result = await repository.mealExists(
      mealInDatabase.name.toUpperCase()
    )

    expect(result).toEqual(true)
  })

  it('should find meal(return true) in the database if excludedId do not match Id', async () => {
    const [mealInDatabase] = await insertAll(db, 'meal', fakeMeal())

    const result = await repository.mealExists(
      mealInDatabase.name,
      mealInDatabase.id + 1
    )

    expect(result).toEqual(true)
  })

  it('should return false if meal not in the database', async () => {
    await insertAll(db, 'meal', fakeMeal())

    const result = await repository.mealExists(
      'meal Name to be used for new meal name'
    )

    expect(result).toEqual(false)
  })

  it('should return false if meal in the database and if excludedId match Id', async () => {
    const [mealInDatabase] = await insertAll(db, 'meal', fakeMeal())

    const result = await repository.mealExists(
      mealInDatabase.name,
      mealInDatabase.id
    )

    expect(result).toEqual(false)
  })
})
