import { createTestDatabase } from '@tests/utils/database'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { roleRepository } from '../roleRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = roleRepository(db)

describe('getRoles', () => {
  it('should return all roles from database', async () => {
    const roles = await repository.getRoles()

    expect(roles).toContain('admin')
    expect(roles).toContain('chef')
    expect(roles).toContain('user')
  })
})

describe('getRoleIdByName', () => {
  it('should return id of role admin', async () => {
    const id = await repository.getRoleIdByName('admin')

    expect(id).toEqual({ id: 1 })
  })
})

describe('getRoleNameById', () => {
  it('should return id of role admin', async () => {
    const id = await repository.getRoleNameById(1)

    expect(id).toEqual({ name: 'admin' })
  })
})
