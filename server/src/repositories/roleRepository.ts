import type { Database } from '@server/database'
import type { Role } from '@server/entities/role'

export function roleRepository(db: Database) {
  return {
    async getRoles() {
      const roles = await db.selectFrom('role').select('role.name').execute()

      return roles.map((_) => _.name)
    },

    async getRoleIdByName(name: Role): Promise<{ id: number } | undefined> {
      return db
        .selectFrom('role')
        .where('name', '=', name)
        .select('id')
        .executeTakeFirst()
    },

    async getRoleNameById(id: number): Promise<{ name: Role } | undefined> {
      const role = await db
        .selectFrom('role')
        .where('id', '=', id)
        .select('name')
        .executeTakeFirst()
      return role ? { name: role.name as Role } : undefined
    },
  }
}

export type RoleRepository = ReturnType<typeof roleRepository>
