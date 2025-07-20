/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prettier/prettier */
// backend/app/controllers/bots_controller.ts

import type { HttpContext } from '@adonisjs/core/http'
import StudentChat from '#models/student_chat'
import StudentProfile from '#models/student_profile'
import MentorProfile from '#models/mentor_profile'
import axios from 'axios'

export default class BotController {
  async ask({ auth, request, response }: HttpContext) {
    const user = auth.use('api').user!
    const { question } = request.only(['question'])

    // =================================================================
    // STUDENT LOGIC
    // =================================================================
    if (user.role === 'student') {
      try {
        const pastChats = await StudentChat.query()
          .where('user_id', user.id)
          .orderBy('id', 'desc')
          .limit(5)
        const chatHistory = pastChats
          .map((m) => `Q: ${m.question}\nA: ${m.answer}`)
          .reverse()
          .join('\n\n')

        const payload = {
          role: 'student',
          question,
          chat_history: chatHistory,
        }
        console.log('Sending payload to Flask bot (Student):', payload)
        const result = await axios.post('http://localhost:8000/ask', payload)

        console.log('Received raw response from Flask bot:', result.data)

        const answer = result.data.answer
        if (answer === undefined) {
          console.error("Flask bot response is missing the 'answer' field.", result.data)
          return response.internalServerError({ answer: 'Sorry, the bot returned an invalid response.' })
        }

        await StudentChat.create({ userId: user.id, question, answer })

        // --- Generate and update progress summary in the background ---
        this.updateProgressSummary(user.id) // Fire-and-forget

        return response.ok({ answer })
      } catch (error) {
        console.error('Error in BotController while calling Flask (Student):', error.message)
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          return response.serviceUnavailable({
            answer: 'Sorry, the AI assistant is currently offline. Please try again later.',
          })
        }
        return response.internalServerError({
          answer: 'An unexpected error occurred while communicating with the bot.',
        })
      }
    }

    // =================================================================
    // MENTOR LOGIC
    // =================================================================
    if (user.role === 'mentor') {
      try {
        const mentor = await MentorProfile.findBy('user_id', user.id)
        if (!mentor) {
          return response.unauthorized({ message: 'Mentor profile not found' })
        }
    
        const students = await StudentProfile.query().where('school', mentor.school).preload('user')
    
        if (students.length === 0) {
          return response.ok({ answer: 'It looks like there are no students assigned to your school yet.' })
        }
    
        // 1. EFFICIENTLY FETCH ALL RELEVANT CHATS AT ONCE
        // Get an array of all student user IDs
        const studentUserIds = students.map((s) => s.userId)
        // Fetch all chats for those students in a single database query
        const allChats = await StudentChat.query().whereIn('user_id', studentUserIds)
    
        const data_context =
          `Here is the latest data for students at ${mentor.school}:\n\n` +
          students
            .map((s) => {
              // 2. FILTER THE FETCHED CHATS IN MEMORY (FAST)
              // Filter the 'allChats' array for the current student's chats
              const prompts = allChats
                .filter((chat) => chat.userId === s.userId) // Use the correct key for joining
                .map((chat) => `    - "${chat.question}"`) // Format each prompt
                .join('\n')
    
              return (
                `Student Record:\n` +
                `  - ID: ${s.id}\n` +
                `  - Name: ${s.user?.fullName || 'Name not recorded'}\n` +
                `  - Grade: ${s.grade || 'Grade not set'}\n` +
                `  - Class: ${s.className || 'Class not set'}\n` +
                `  - Progress: ${s.progressSummary || 'Progress not yet available'}\n` +
                // 3. CORRECTLY APPEND THE PROMPTS STRING
                `  - Prompts:\n${prompts || '    - No prompts recorded.'}`
              )
            })
            .join('\n\n')
    
        const system_prompt = `You are an intelligent, concise assistant in an ONGOING CONVERSATION with a school mentor.
- **Do not use opening pleasantries like "Hi there!" or "Hello!" after the first turn.**
- **The user will provide data. Acknowledge you have it and get straight to the point.** Do not repeat the data back to the user unless they ask for a summary.
- Your primary job is to answer the mentor's questions based on the provided student data and the conversation history.
- Summarize data clearly and conversationally.
- When you are asked for a general report, provide a bulleted list summarizing each student.
- Base your answers *only* on the data provided.`
    
        const payload = {
          role: 'mentor',
          question: question,
          system_prompt: system_prompt,
          data_context: data_context,
        }
        // console.log('Sending payload to Flask bot (Mentor):', payload)
        const result = await axios.post('http://localhost:8000/ask', payload)
    
        // console.log('Received raw response from Flask bot:', result.data)
    
        const answer = result.data.answer
        if (answer === undefined) {
          console.error("Flask bot response is missing the 'answer' field.", result.data)
          return response.internalServerError({ answer: 'Sorry, the bot returned an invalid response.' })
        }
    
        return response.ok({ answer })
      } catch (error) {
        console.error('Error in BotController while calling Flask (Mentor):', error) // Log the full error
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          return response.serviceUnavailable({
            answer: 'Sorry, the AI assistant is currently offline. Please try again later.',
          })
        }
        return response.internalServerError({
          answer: 'An unexpected error occurred while communicating with the bot.',
        })
      }
    }

    return response.badRequest({ message: 'Invalid user role' })
  }

  /**
   * NEW METHOD
   * Fetches recent chat history, generates a summary, and updates the student's profile.
   * Runs in the background and does not block the user's request.
   */
  async updateProgressSummary(userId: number) {
    try {
      console.log(`Starting background summary update for user ID: ${userId}`)
      const chats = await StudentChat.query().where('user_id', userId).orderBy('id', 'desc').limit(10)

      if (chats.length < 2) {
        console.log('Not enough chat history to generate a summary. Aborting.')
        return
      }

      const summaryContext = chats
        .map((c) => `Student asked: "${c.question}"\nBot answered: "${c.answer}"`)
        .reverse()
        .join('\n\n')

      const system_prompt = `You are an expert academic advisor. Your task is to analyze a student's conversation with a tutoring bot. Based on the chat history provided, write a concise, one-sentence summary (max 25 words) of the student's current status. Focus on their main topic of interest, any struggles, or their level of understanding. For example: "The student is actively learning about robot controllers and seems to be grasping the core concepts." or "The student is struggling to understand the difference between sensors and actuators."`

      const result = await axios.post('http://localhost:8000/ask', {
        role: 'mentor',
        question: 'Generate a progress summary based on the provided chat history.',
        system_prompt: system_prompt,
        data_context: summaryContext,
      })

      const newSummary = result.data.answer

      if (newSummary && newSummary.trim() !== '') {
        const studentProfile = await StudentProfile.findBy('user_id', userId)
        if (studentProfile) {
          studentProfile.progressSummary = newSummary
          await studentProfile.save()
          console.log(`Successfully updated summary for user ID: ${userId}`)
        }
      }
    } catch (error) {
      console.error(`Failed to update progress summary for user ID: ${userId}`, error.message)
    }
  }
}
