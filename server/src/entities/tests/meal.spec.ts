import { mealInsertableSchema, mealSchema } from '../meal'

import { fakeMeal } from './fakes'

describe('mealSchema - schema parse', () => {
  it('should validate the schema correctly', async () => {
    const record = fakeMeal({ id: 123, priceEur: 12.2 })

    const meal = mealSchema.parse(record)

    expect(meal).toEqual({
      ...record,
      id: 123,
      priceEur: '12.2',
    })
  })

  it('should validate the schema correctly with priceEur as str', async () => {
    const record = fakeMeal({ id: 123, priceEur: '12.2' })

    const meal = mealSchema.parse(record)

    expect(meal).toEqual({
      ...record,
      id: 123,
    })
  })

  it('should throw a error by incorrect type', async () => {
    const record = fakeMeal({ id: 123, type: 'someType' })

    expect(() => mealSchema.parse(record)).toThrow(/type/i)
  })

  it('should throw a error by incorrect type', async () => {
    const record = fakeMeal({ id: 123, type: 'someType' })

    expect(() => mealSchema.parse(record)).toThrow(/type/i)
  })

  it('should throw a error by priceEur NaN', async () => {
    const record = fakeMeal({ id: 123, type: 'main', priceEur: 'some' })

    expect(() => mealSchema.parse(record)).toThrow(/priceEur/i)
  })

  it('should throw a error by empty name', async () => {
    const record = fakeMeal({ id: 123, name: ' ' })

    expect(() => mealSchema.parse(record)).toThrow(/name/i)
  })
})

describe('mealInsertable - schema parse', () => {
  it('should validate the schema correctly without id', async () => {
    const record = fakeMeal()

    const meal = mealInsertableSchema.parse(record)

    expect(meal).toEqual(record)
  })
})
