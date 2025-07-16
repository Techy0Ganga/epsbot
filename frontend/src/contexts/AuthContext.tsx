// AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { login as loginApi, register as registerApi } from '../utils/api'
import type { RegisterPayload, LoginResponse } from '../utils/api'

type Role = 'student' | 'mentor' | 'admin'

// This interface holds the user state within the React app
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
  register: (payload: RegisterPayload) => Promise<void>
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res: LoginResponse = await loginApi(email, password)
    setToken(res.token)
    setUser(res.user)
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))
  }

  // --- THIS IS THE FIX ---
  // The register function does not log the user in.
  // It simply calls the API to create the account and returns nothing (void).
  // It should NOT try to set a token or user.
  const register = async (payload: RegisterPayload): Promise<void> => {
    await registerApi(payload)
  }

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