/* eslint-disable prettier/prettier */
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('full_name')
      table.string('grade')
      table.string('class_name')
      table.string('school').notNullable()
      table.text('progress_summary').nullable() 

    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
