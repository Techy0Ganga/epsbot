import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class MentorOnlyMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    const user = auth.use('api').user!

    if (user.role !== 'mentor') {
      return response.forbidden({ error: 'Mentors only' })
    }

    await next()
  }
}
