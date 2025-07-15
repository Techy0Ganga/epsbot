import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { login as loginApi, register as registerApi } from '../utils/api'
import type { RegisterPayload } from '../utils/api'

type Role = 'student' | 'mentor' | 'admin'

interface UserInfo {
  id: number
  email: string
  role: Role
  fullName?: string
  grade?: string
  class?: string
  department?: string
  experience?: string
}

interface AuthContextType {
  user: UserInfo | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void> // we'll type this later
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // 🔁 Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // 🔐 Login
  const login = async (email: string, password: string) => {
    const res = await loginApi(email, password)
    setToken(res.token)
    setUser(res.user)
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))
  }

  // 📝 Register
  const register = async (payload: RegisterPayload) => {
    const res = await registerApi(payload)
    setToken(res.token)
    setUser(res.user)
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))
  }

  // 🚪 Logout
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
