/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prettier/prettier */
// backend/app/controllers/bots_controller.ts

import type { HttpContext } from '@adonisjs/core/http'
import StudentChat from '#models/student_chat'
import StudentProfile from '#models/student_profile'
import MentorProfile from '#models/mentor_profile'
import User from '#models/user' // Assuming you have a User model to get names
import axios from 'axios'

export default class BotController {
  async ask({ auth, request, response }: HttpContext) {
    const user = auth.use('api').user!
    const { question } = request.only(['question'])

    // =================================================================
    // STUDENT LOGIC (Uses RAG for general knowledge)
    // =================================================================
    if (user.role === 'student') {
      try {
        // Fetch recent chat history to provide conversation memory
        const pastChats = await StudentChat.query()
          .where('user_id', user.id)
          .orderBy('id', 'desc')
          .limit(5)

        const chatHistory = pastChats
          .map((m) => `Q: ${m.question}\nA: ${m.answer}`)
          .reverse() // Chronological order is better for LLMs
          .join('\n\n')

        // For students, we send the question and chat history.
        // The Flask bot will use RAG to find answers from course documents.
        const result = await axios.post('http://localhost:8000/ask', {
          role: 'student', // IMPORTANT: We now pass the role
          question,
          chat_history: chatHistory,
        })

        const answer = result.data.answer

        // Save the new interaction to the student's chat history
        await StudentChat.create({ userId: user.id, question, answer })

        return response.ok({ answer })
      } catch (error) {
        // Gracefully handle connection errors to the Python bot
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.error('BOT SERVER CONNECTION FAILED (Student Request):', error.message)
          return response.serviceUnavailable({
            answer: 'Sorry, the AI assistant is currently unavailable. Please try again later.',
          })
        }
        // Handle other unexpected errors
        console.error('An unexpected error occurred during student request:', error)
        return response.internalServerError({
          answer: 'An unexpected error occurred. Please contact support.',
        })
      }
    }

    // =================================================================
    // MENTOR LOGIC (Uses data-driven context, NO RAG)
    // =================================================================
    if (user.role === 'mentor') {
      try {
        const mentor = await MentorProfile.findBy('user_id', user.id)
        if (!mentor) {
          return response.unauthorized({ message: 'Mentor profile not found' })
        }

        const students = await StudentProfile.query().where('school', mentor.school).preload('user')

        const data_context =
          `List of students at ${mentor.school}:\n\n` +
          students
            .map(
              (s) =>
                `Student:\n` +
                `  ID: ${s.id}\n` +
                `  Name: ${s.user?.fullName || 'N/A'}\n` + // Defensive check for user/name
                `  Grade: ${s.grade}\n` +
                `  Class: ${s.className}\n` +
                `  Progress Summary: ${s.progressSummary || 'Not available'}`
            )
            .join('\n\n')

        const system_prompt = `You are a helpful assistant for a school mentor. Your task is to answer the mentor's questions based *only* on the student data provided in the 'data_context'. Do not use any other knowledge. Be concise and clear. If the question is general (e.g., "how are my students?"), provide a high-level summary for all students. If it's specific to one student, focus on their data.`

        const result = await axios.post('http://localhost:8000/ask', {
          role: 'mentor',
          question: question,
          system_prompt: system_prompt,
          data_context: data_context,
        })

        const answer = result.data.answer
        return response.ok({ answer })
      } catch (error) {
        // Gracefully handle connection errors to the Python bot
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.error('BOT SERVER CONNECTION FAILED (Mentor Request):', error.message)
          return response.serviceUnavailable({
            answer: 'Sorry, the AI assistant is currently unavailable. Please try again later.',
          })
        }
        // Handle other unexpected errors
        console.error('An unexpected error occurred during mentor request:', error)
        return response.internalServerError({
          answer: 'An unexpected error occurred. Please contact support.',
        })
      }
    }

    // Fallback for any other roles
    return response.badRequest({ message: 'Invalid user role' })
  }
}