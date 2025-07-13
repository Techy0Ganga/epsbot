import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthGuardMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    const user = await auth.use('api').check()

    if (!user) {
      return response.unauthorized({ error: 'Unauthorized' })
    }

    await next()
  }
}
