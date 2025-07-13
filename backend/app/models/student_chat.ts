import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class StudentChat extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare userId: number
  @column() declare question: string
  @column() declare answer: string
}
