import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('order')
    .ifNotExists()
    .addColumn('id', 'integer', (col) =>
      col.primaryKey().generatedByDefaultAsIdentity()
    )
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('userId', 'integer', (col) =>
      col.notNull().references('user.id').onDelete('restrict')
    )
    .addColumn('soupMealId', 'integer', (col) =>
      col.references('menu.id').onDelete('restrict')
    )
    .addColumn('mainMealId', 'integer', (col) =>
      col.references('menu.id').onDelete('restrict')
    )
    .addUniqueConstraint('order_date_user_unique', ['date', 'userId'])
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('order').execute()
}
