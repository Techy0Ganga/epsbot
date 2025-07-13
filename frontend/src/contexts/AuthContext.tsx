
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  userRole: 'student' | 'mentor' | 'admin' | null;
  userInfo: {
    name: string;
    id: string;
    grade?: string;
    class?: string;
  } | null;
  login: (role: 'student' | 'mentor' | 'admin') => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<'student' | 'mentor' | 'admin' | null>(null);
  const [userInfo, setUserInfo] = useState<AuthContextType['userInfo']>(null);

  const login = (role: 'student' | 'mentor' | 'admin') => {
    setUserRole(role);
    
    // Mock user data based on role
    const mockUserData = {
      student: {
        name: 'Alex Johnson',
        id: 'STU001',
        grade: 'Grade 8',
        class: 'Class 8A'
      },
      mentor: {
        name: 'Sarah Wilson',
        id: 'MEN001',
        class: 'Math Department'
      },
      admin: {
        name: 'Dr. Michael Chen',
        id: 'ADM001'
      }
    };

    setUserInfo(mockUserData[role]);
  };

  const logout = () => {
    setUserRole(null);
    setUserInfo(null);
  };

  const isAuthenticated = userRole !== null;

  return (
    <AuthContext.Provider value={{
      userRole,
      userInfo,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};
