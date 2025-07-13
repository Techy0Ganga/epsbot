const API_URL = 'http://localhost:3333'

type Role = 'student' | 'mentor'

type StudentRegisterPayload = {
  email: string
  password: string
  role: 'student'
  grade: string
  className: string
}

type MentorRegisterPayload = {
  email: string
  password: string
  role: 'mentor'
  department: string
  experience: string
}

type RegisterPayload = StudentRegisterPayload | MentorRegisterPayload

type LoginResponse = {
  user: {
    id: number
    email: string
    role: Role
    fullName?: string
  }
  token: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Register failed')
  return res.json()
}

export async function askBot(token: string, question: string): Promise<{ answer: string }> {
  const res = await fetch(`${API_URL}/ask`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  })
  if (!res.ok) throw new Error('Bot request failed')
  return res.json()
}
