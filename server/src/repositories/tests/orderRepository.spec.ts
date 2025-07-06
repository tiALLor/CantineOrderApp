import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { selectAll, insertAll } from '@tests/utils/records'
import { fakeUser, fakeMenu, fakeMeal } from '@server/entities/tests/fakes'
import { orderRepository } from '../orderRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = orderRepository(db)

const [userOne] = await insertAll(db, 'user', [
  fakeUser({ id: 2, name: 'Alice' }),
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

describe('createOrderForMenu - create a order', () => {
  it('should create a day menu meal order', async () => {
    const record = {
      date: validDate,
      userId: userOne.id,
      soupMealId: mealOne.id,
      mainMealId: mealTwo.id,
    }

    const orderForMenu = await repository.createOrderForMenu(record)

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

  it('should create a day menu meal order with null MealId', async () => {
    const record = {
      date: validDate,
      userId: userOne.id,
      soupMealId: null,
      mainMealId: null,
    }

    const orderForMenu = await repository.createOrderForMenu(record)

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

  it('should throw a error if userId do not exist', async () => {
    const record = {
      date: validDate,
      userId: 99999,
      soupMealId: null,
      mainMealId: null,
    }

    await expect(repository.createOrderForMenu(record)).rejects.toThrow(
      /user_id/i
    )
  })

  it('should throw a error if soupMealId do not exist', async () => {
    const record = {
      date: validDate,
      userId: userOne.id,
      soupMealId: 99999,
      mainMealId: null,
    }

    await expect(repository.createOrderForMenu(record)).rejects.toThrow(
      /soup_meal_id/i
    )
  })

  it('should throw a error if soupMealId do not exist', async () => {
    const record = {
      date: validDate,
      userId: userOne.id,
      soupMealId: mealOne.id,
      mainMealId: 99999,
    }

    await expect(repository.createOrderForMenu(record)).rejects.toThrow(
      /main_meal_id/i
    )
  })
})

describe('updateOrder', () => {
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

    const updatedOrder = await repository.updateOrder(
      orderForMenu.userId,
      record
    )

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

  it('should update the order with partial value', async () => {
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

    const updatedOrder = await repository.updateOrder(
      orderForMenu.userId,
      record
    )

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
})

describe('get order data by user and date', () => {
  it('should return the user data', async () => {
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

    const order = await repository.getOrderByUserDates(userOne.id, [
      validDate,
      anotherValidDate,
    ])

    expect(order).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          userName: userOne.name,
          date: dateAsString,
          userId: userOne.id,
          soupMealId: mealOne.id,
          soupMealName: mealOne.name,
          soupMealPrice: mealOne.priceEur,
          mainMealId: mealTwo.id,
          mainMealName: mealTwo.name,
          mainMealPrice: mealTwo.priceEur,
        },
        {
          id: expect.any(Number),
          userName: userOne.name,
          date: anotherDateAsString,
          userId: userOne.id,
          soupMealId: mealTree.id,
          soupMealName: mealTree.name,
          soupMealPrice: mealTwo.priceEur,
          mainMealId: mealFour.id,
          mainMealName: mealFour.name,
          mainMealPrice: mealFour.priceEur,
        },
      ])
    )
  })
})

describe('get users monthly cost summary', () => {
  it('should do something', async () => {
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

    const summary = await repository.getMonthlyCosts(userOne.id, {
      year: 2025,
      month: 5,
    })

    expect(summary).toEqual({
      priceEur: '4',
    })
  })
})
