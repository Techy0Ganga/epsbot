/* eslint-disable prettier/prettier */
/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const BotController = () => import('#controllers/bots_controller')

router.post('/register', [AuthController, 'register'])
router.post('/login', [AuthController, 'login'])
router.post('/logout', [AuthController, 'logout']).middleware([middleware.auth()])

router.get('/me', async ({ auth, response }) => {
  await auth.use('api').check()
  return response.ok({ user: auth.use('api').user })
}).middleware([middleware.auth()])

router.get('/mentor/students', async ({ response }) => {
  return response.ok({ students: ['Zani', 'Lira', 'Kai'] }) // fake data for now
}).middleware([middleware.auth(), middleware.mentorOnly()])

router.post('/bot/ask', [BotController, 'ask']).middleware([middleware.auth()])



router.get('/', async () => {
  return {
    hello: 'world',
  }
})
