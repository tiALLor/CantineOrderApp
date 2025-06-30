import {
  menuInsertableSchema,
  menuSchema,
  menuGetSchemaTypeDates,
} from '../menu'
import { fakeMenu } from './fakes'

describe('menuSchema - schema parse', () => {
  it('should parse the schema with date as string', async () => {
    const record = fakeMenu({ id: 122, date: '2025-01-05' })

    const menu = menuSchema.parse(record)

    expect(menu).toEqual({ ...record, date: new Date('2025-01-05') })
  })

  it('should parse the schema with date as Date', async () => {
    const record = fakeMenu({ id: 122, date: new Date('2025-01-05') })

    const menu = menuSchema.parse(record)

    expect(menu).toEqual({ ...record, date: new Date('2025-01-05') })
  })

  it('should throw a error by invalid date ', async () => {
    const record = fakeMenu({ id: 122, date: 'jhfgaj' })

    expect(() => menuSchema.parse(record)).toThrow(/date/i)
  })

  it('should throw a error by empty date ', async () => {
    const record = fakeMenu({ id: 122, date: '' })

    expect(() => menuSchema.parse(record)).toThrow(/date/i)
  })

  it('should throw a error if mealId is not a number ', async () => {
    // @ts-expect-errorTS-expect-error
    const record = fakeMenu({ id: 122, mealId: 'kgh' })

    expect(() => menuSchema.parse(record)).toThrow(/mealId/i)
  })

  it('should throw a error if mealId is empty ', async () => {
    // @ts-expect-errorTS-expect-error
    const record = fakeMenu({ id: 122, mealId: '' })

    expect(() => menuSchema.parse(record)).toThrow(/mealId/i)
  })
})

describe('menuInsertable - schema parse', () => {
  it('should validate the schema correctly without id', async () => {
    const record = fakeMenu()

    const menu = menuInsertableSchema.parse(record)

    expect(menu).toEqual(record)
  })
})

describe('menuGetSchemaTypeDates - schema parse', () => {
  it('should validate the schema correctly', async () => {
    const record = {
      type: 'main',
      dates: ['2025-01-22', new Date('2025-01-05')],
    }

    const dateTypeDate = menuGetSchemaTypeDates.parse(record)

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
    const dateTypeDate = menuGetSchemaTypeDates.parse(record)

    expect(dateTypeDate).toEqual({
      type: 'main',
      dates: [],
    })
  })

  it('should throw a error if dates are empty str ', async () => {
    const record = {
      type: 'main',
      dates: '',
    }
    expect(() => menuGetSchemaTypeDates.parse(record)).toThrow(/dates/i)
  })

  it('should throw a error if the date is invalid', async () => {
    const record = {
      type: 'main',
      dates: ['2025-01-35', new Date('2025-01-05')],
    }

    expect(() => menuGetSchemaTypeDates.parse(record)).toThrow(/Invalid date/i)
  })

  it('should throw a error if the type is invalid', async () => {
    const record = {
      type: 'some',
      dates: ['2025-01-03', new Date('2025-01-05')],
    }

    expect(() => menuGetSchemaTypeDates.parse(record)).toThrow(/type/i)
  })
})
