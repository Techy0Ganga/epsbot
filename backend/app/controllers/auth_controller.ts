/* eslint-disable prettier/prettier */
// app/controllers/auth_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import User from '#models/user'

export default class AuthController {
  //register user
  async register({ request, response }: HttpContext) {
    const registerSchema = vine.object({
      fullName: vine.string().minLength(3),
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
      fullName, // Correctly destructured
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

    // --- FIX: fullName is now included when creating the User ---
    const user = await User.create({ fullName, email, password, role })

    if (role === 'student') {
      // --- FIX: fullName is removed from profile creation, and a default summary is added ---
      await user.related('studentProfile').create({
        grade,
        className,
        school,
        progressSummary: 'Student has just registered. No progress to report yet.',
      })
    } else if (role === 'mentor') {
      await user.related('mentorProfile').create({ department, experience, school })
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
    // Ensure the user is authenticated using the 'api' guard
    await auth.use('api').authenticate()

    // Get the authenticated user object
    const user = auth.use('api').getUserOrFail()

    // Access the current access token from the user object
    const token = user.currentAccessToken

    // Delete the specific token that was used for this request
    await User.accessTokens.delete(user, token.identifier)

    return response.ok({ message: 'Logged out successfully' })
  }
}