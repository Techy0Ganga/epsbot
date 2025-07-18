import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class StudentProfile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare fullName: string

  @column()
  declare grade: string

  @column({ columnName: 'class_name' })
  declare className: string

  @column()
  declare progressSummary: string

  @column()
  declare school: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
