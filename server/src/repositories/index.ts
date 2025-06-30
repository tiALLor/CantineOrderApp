import type { Database } from '@server/database'

// TODO: update the links to repository handlers
import { roleRepository } from './roleRepository'
import { userRepository } from './userRepository'
import { mealRepository } from './mealRepository'
import { menuRepository } from './menuRepository'

export type RepositoryFactory = <T>(db: Database) => T

// index of all repositories for provideRepos
const repositories = {
  roleRepository,
  userRepository,
  mealRepository,
  menuRepository,
}

export type RepositoriesFactories = typeof repositories
export type Repositories = {
  [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>
}
export type RepositoriesKeys = keyof Repositories

export { repositories }
