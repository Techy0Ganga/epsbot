// frontend/src/utils/api.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

type Role = 'student' | 'mentor'

// Interface for the raw response from AdonisJS Login
interface AdonisTokenResponse {
  user: LoginResponse['user'];
  // --- THIS IS THE FIX ---
  // Replaced 'any' with 'unknown' to satisfy the linting rule.
  // This is safer and requires type checks if you were to use these other properties.
  token: { token: string; [key: string]: unknown };
}

// Interface for the clean data the rest of our app will use
export interface LoginResponse {
  user: {
    id: number
    email: string
    role: Role
    fullName?: string
  }
  token: string
}

export interface RegisterPayload {
  email: string
  password: string
  role: 'student' | 'mentor'
  fullName?: string
  grade?: string
  className?: string
  department?: string
  experience?: number // This MUST be a number to match the backend
  school: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    throw new Error(errorBody.message || 'Invalid credentials or server error.')
  }

  const rawData: AdonisTokenResponse = await res.json()
  return {
    user: rawData.user,
    token: rawData.token.token,
  }
}

export async function register(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    throw new Error(errorBody.message || 'Registration failed on the server.')
  }
}

export async function askBot(token: string, question: string): Promise<{ answer: string }> {
  const res = await fetch(`${API_URL}/bot/ask`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    const message = errorData?.message || `Bot request failed with status ${res.status}`
    throw new Error(message)
  }

  return res.json()
}