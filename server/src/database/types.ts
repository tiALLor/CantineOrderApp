import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

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
  role: Role
  user: User
}
