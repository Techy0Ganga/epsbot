/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import StudentChat from '#models/student_chat'
import StudentProfile from '#models/student_profile'
import MentorProfile from '#models/mentor_profile'
import axios from 'axios'

export default class BotController {
  async ask({ auth, request, response }: HttpContext) {
    const user = auth.use('api').user!
    const { question } = request.only(['question'])

    let memory = ''
    let chatHistory = ''
    let additionalContext = ''

    if (user.role === 'student') {
      // Student: fetch recent chat
      const pastChats = await StudentChat.query()
        .where('user_id', user.id)
        .orderBy('id', 'desc')
        .limit(5)

      chatHistory = pastChats.map(m => `Q: ${m.question}\nA: ${m.answer}`).join('\n\n')
    }

    if (user.role === 'mentor') {
      // Mentor: fetch students from same school
      const mentor = await MentorProfile.findBy('user_id', user.id)
      if (!mentor) return response.unauthorized({ message: 'Mentor profile not found' })

      const students = await StudentProfile.query()
        .where('school', mentor.school)

      additionalContext = students.map(s =>
        `Student: ${s.id}, Grade: ${s.grade}, Class: ${s.className}, Progress: ${s.progressSummary || 'N/A'}`
      ).join('\n\n')

      memory = `Mentor Context: Showing student progress for school: ${mentor.school}\n\n${additionalContext}`
    }

    const result = await axios.post('http://localhost:8000/ask', {
      question,
      user_id: user.id,
      memory: user.role === 'student' ? chatHistory : memory,
    })

    const answer = result.data.answer

    // Save student chats only (optional to store mentor questions)
    if (user.role === 'student') {
      await StudentChat.create({ userId: user.id, question, answer })
    }

    return response.ok({ answer })
  }
}
