/* eslint-disable prettier/prettier */
// import type { HttpContext } from '@adonisjs/core/http'

import type { HttpContext } from '@adonisjs/core/http'  // ✅ Needed
import StudentChat from '#models/student_chat'           // ✅ Needed to use the model
import axios from 'axios' 

export default class BotController {
  async ask({ auth, request, response }: HttpContext) {
    const user = auth.use('api').user!
    const { question } = request.only(['question'])

    const memory = await StudentChat.query()
      .where('user_id', user.id)
      .orderBy('id', 'desc')
      .limit(5)

    const chatHistory = memory.map(m => `Q: ${m.question}\nA: ${m.answer}`).join('\n\n')

    const result = await axios.post('http://localhost:8000/ask', {
      question,
      user_id: user.id,
      memory: chatHistory,
    })

    const answer = result.data.answer

    await StudentChat.create({ userId: user.id, question, answer })

    return response.ok({ answer })
  }
}

