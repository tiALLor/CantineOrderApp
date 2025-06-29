import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('meal')
    .addColumn('id', 'integer', (col) =>
      col.primaryKey().generatedByDefaultAsIdentity()
    )
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('price', 'numeric', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('meal').execute()
}
