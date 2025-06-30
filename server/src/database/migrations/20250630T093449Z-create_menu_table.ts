import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('menu')
    .ifNotExists()
    .addColumn('id', 'integer', (col) =>
      col.primaryKey().generatedByDefaultAsIdentity()
    )
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('mealId', 'integer', (col) =>
      col.notNull().references('meal.id').onDelete('restrict')
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('menu').execute()
}
