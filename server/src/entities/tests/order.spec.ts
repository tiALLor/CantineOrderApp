import {
  orderInsertableSchema,
  orderSchema,
  orderSchemaGetByTypeDates,
  orderSchemaGetByYearMonth,
} from '../order'
import { fakeOrder } from './fakes'

// TODO: erase if n o longer needed
describe('orderSchema - schema parse', () => {
  it('should do something', async () => {})
})

describe('orderSchema - schema parse', () => {
  it('should parse the schema with date as string', async () => {
    const record = fakeOrder({ id: 122, date: '2025-01-05' })

    const order = orderSchema.parse(record)

    expect(order).toEqual({ ...record, date: new Date('2025-01-05') })
  })

  it('should parse the schema with date as Date', async () => {
    const record = fakeOrder({ id: 122, date: new Date('2025-01-05') })

    const order = orderSchema.parse(record)

    expect(order).toEqual({ ...record, date: new Date('2025-01-05') })
  })

  it('should throw a error by invalid date ', async () => {
    const record = fakeOrder({ id: 122, date: 'invalid' })

    expect(() => orderSchema.parse(record)).toThrow(/date/i)
  })

  it('should throw a error by empty date ', async () => {
    const record = fakeOrder({ id: 122, date: '' })

    expect(() => orderSchema.parse(record)).toThrow(/date/i)
  })

  it('should throw a error if soupMealId is not a number ', async () => {
    // @ts-expect-error
    const record = fakeOrder({ id: 122, soupMealId: 'kgh' })

    expect(() => orderSchema.parse(record)).toThrow(/soupMealId/i)
  })

  it('should throw a error if mainMealId is not a number ', async () => {
    // @ts-expect-error
    const record = fakeOrder({ id: 122, mainMealId: 'kgh' })

    expect(() => orderSchema.parse(record)).toThrow(/mainMealId/i)
  })
})

describe('orderInsertable - schema parse', () => {
  it('should validate the schema correctly without id', async () => {
    const record = fakeOrder()

    const order = orderInsertableSchema.parse(record)

    expect(order).toEqual(record)
  })
})

describe('orderSchemaGetByTypeDates - schema parse', () => {
  it('should validate the schema correctly', async () => {
    const record = {
      type: 'main',
      dates: ['2025-01-22', new Date('2025-01-05')],
    }

    const dateTypeDate = orderSchemaGetByTypeDates.parse(record)

    expect(dateTypeDate).toEqual({
      type: 'main',
      dates: [new Date('2025-01-22'), new Date('2025-01-05')],
    })
  })

  it('should validate the schema with empty date []', async () => {
    const record = {
      type: 'main',
      dates: [],
    }
    const strTypeDate = orderSchemaGetByTypeDates.parse(record)

    expect(strTypeDate).toEqual({
      type: 'main',
      dates: [],
    })
  })

  it('should throw a error if dates are empty str ', async () => {
    const record = {
      type: 'main',
      dates: '',
    }
    expect(() => orderSchemaGetByTypeDates.parse(record)).toThrow(/dates/i)
  })

  it('should throw a error if the date is invalid', async () => {
    const record = {
      type: 'main',
      dates: ['2025-01-35', new Date('2025-01-05')],
    }

    expect(() => orderSchemaGetByTypeDates.parse(record)).toThrow(
      /Invalid date/i
    )
  })

  it('should throw a error if the type is invalid', async () => {
    const record = {
      type: 'some',
      dates: ['2025-01-03', new Date('2025-01-05')],
    }

    expect(() => orderSchemaGetByTypeDates.parse(record)).toThrow(/type/i)
  })
})

describe('orderSchemaGetByTypeDates - schema parse', () => {
  it('should validate the schema correctly', async () => {
    const record = {
      year: 2025,
      month: 1,
    }

    const result = orderSchemaGetByYearMonth.parse(record)

    expect(result).toEqual(record)
  })

  it('should validate the schema correctly', async () => {
    const record = {
      year: 2100,
      month: 12,
    }

    const result = orderSchemaGetByYearMonth.parse(record)

    expect(result).toEqual(record)
  })

  it('should validate the schema correctly with strings', async () => {
    const record = {
      year: '2030',
      month: '12',
    }

    const result = orderSchemaGetByYearMonth.parse(record)

    expect(result).toEqual({
      year: 2030,
      month: 12,
    })
  })

  it('should throw a error if year is out of range ', async () => {
    const record = {
      year: 1999,
      month: 12,
    }
    expect(() => orderSchemaGetByYearMonth.parse(record)).toThrow(/year/i)
  })

  it('should throw a error if year is NaN ', async () => {
    const record = {
      year: 'some',
      month: 12,
    }
    expect(() => orderSchemaGetByYearMonth.parse(record)).toThrow(/year/i)
  })

  it('should throw a error if month out of range', async () => {
    const record = {
      year: 2025,
      month: 0,
    }
    expect(() => orderSchemaGetByYearMonth.parse(record)).toThrow(/month/i)
  })

  it('should throw a error if month out of range', async () => {
    const record = {
      year: 2025,
      month: 13,
    }
    expect(() => orderSchemaGetByYearMonth.parse(record)).toThrow(/month/i)
  })

  it('should throw a error if month is NaN ', async () => {
    const record = {
      year: 2025,
      month: 'some',
    }
    expect(() => orderSchemaGetByYearMonth.parse(record)).toThrow(/month/i)
  })
})
