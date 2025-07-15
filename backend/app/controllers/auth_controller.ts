/* eslint-disable prettier/prettier */
// import type { HttpContext } from '@adonisjs/core/http'
// app/controllers/auth_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import Hash from '@adonisjs/core/services/hash'

export default class AuthController {

    //register user
    async register({ request, response }: HttpContext) {
      const registerSchema = vine.object({
        email: vine.string().email(),
        password: vine.string().minLength(6),
        role: vine.enum(['student', 'mentor'] as const),
        grade: vine.string().optional(),
        className: vine.string().optional(),
        school: vine.string().optional(),
        department: vine.string().optional(),
        experience: vine.number().optional(),
      })
  
      const {
        email,
        password,
        role,
        grade,
        className,
        school,
        department,
        experience,
      } = await vine.validate({
        schema: registerSchema,
        data: request.all(),
      })
  
      const user = await User.create({ email, password, role })
  
      if (role === 'student') {
        await user.related('studentProfile').create({ grade, className, school })
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
async logout({ auth, response }: HttpContext) {
  // Get a typed instance of the 'api' authenticator.
  // Because the middleware was fixed, TypeScript now knows this is valid.
  const api = auth.use('api')

  // The 'auth' middleware guarantees that if this code runs, the user is authenticated.
  // TypeScript now correctly infers that `currentAccessToken` exists.
  const token = api.currentAccessToken!

  // Delete the specific token that was used for this request.
  await token.delete()

  return response.ok({ message: 'Logged out successfully' })
}

}
