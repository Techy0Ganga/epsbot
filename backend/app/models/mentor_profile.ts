import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class MentorProfile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare department: string

  @column()
  declare experience: number

  @column()
  declare school: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
