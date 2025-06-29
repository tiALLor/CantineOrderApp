import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export type Numeric = ColumnType<string, number | string, number | string>

export interface Meal {
  id: Generated<number>
  name: string
  priceEur: Numeric
  type: string
}

export interface Role {
  id: Generated<number>
  name: string
}

export interface User {
  email: string
  id: Generated<number>
  name: string
  password: string
  roleId: number
}

export interface DB {
  meal: Meal
  role: Role
  user: User
}
