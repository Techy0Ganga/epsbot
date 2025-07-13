/* eslint-disable prettier/prettier */
// import type { HttpContext } from '@adonisjs/core/http'
// app/controllers/auth_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

export default class AuthController {

    //register user
    async register({ request, response }: HttpContext) {
      const registerSchema = vine.object({
        email: vine.string().email(),
        password: vine.string().minLength(6),
        role: vine.enum(['student', 'mentor'] as const),
        grade: vine.string().optional(),
        className: vine.string().optional(),
        department: vine.string().optional(),
        experience: vine.number().optional(),
      })
  
      const {
        email,
        password,
        role,
        grade,
        className,
        department,
        experience,
      } = await vine.validate({
        schema: registerSchema,
        data: request.all(),
      })
  
      const user = await User.create({ email, password, role })
  
      if (role === 'student') {
        await user.related('studentProfile').create({ grade, className })
      } else if (role === 'mentor') {
        await user.related('mentorProfile').create({ department, experience })
      }
  
      return response.created({ user })
    }

//login
  async login({ request, response }: HttpContext) {
    const loginSchema = vine.object({
      email: vine.string().email(),
      password: vine.string().minLength(6),
    })

    const { email, password } = await vine.validate({
      schema: loginSchema,
      data: request.only(['email', 'password']),
    })

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    return response.ok({ user, token })
  }
//log out
async logout({ auth, request, response }: HttpContext) {
    const user = auth.use('api').user
  
    if (!user) {
      return response.unauthorized({ error: 'Not authenticated' })
    }
  
    // Extract token string from header
    const authHeader = request.header('Authorization')
    if (!authHeader?.startsWith('Bearer oat_')) {
      return response.badRequest({ error: 'Invalid token format' })
    }
  
    const rawToken = authHeader.replace('Bearer ', '').trim()
  
    // Query the database manually to find token record
    const tokenRow = await db
      .from('auth_access_tokens')
      .where('user_id', user.id)
      .andWhere('token', rawToken)
      .first()
  
    if (!tokenRow) {
      return response.notFound({ error: 'Token not found or already revoked' })
    }
  
    // Delete it using its ID
    await User.accessTokens.delete(user, tokenRow.id)
  
    return response.ok({ message: 'Logged out successfully' })
  }
}
