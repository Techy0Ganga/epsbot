/* eslint-disable prettier/prettier */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'mentor_profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // FK to users table
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      // Mentor-specific fields
      table.string('department')
      table.integer('experience') // ⬅️ NOT bio anymore
      table.string('school').notNullable()


      // Timestamps
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
