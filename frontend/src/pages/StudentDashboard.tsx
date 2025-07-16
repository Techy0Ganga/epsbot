// frontend/src/pages/StudentDashboard.tsx

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import EnhancedChatBot from '@/components/EnhancedChatBot';
import { useAuth } from '@/contexts/AuthContext'; // 1. Import the useAuth hook

const StudentDashboard = () => {
  // 2. Get the authentication state. `isAuthenticated` is derived from the token.
  const { isAuthenticated, user } = useAuth();

  // 3. This is the crucial guard clause.
  // If the context hasn't updated yet (after login) or hasn't loaded from localStorage (on refresh),
  // show a loading state instead of the chatbot.
  if (!isAuthenticated) {
    // You can replace this with a fancy spinner or loading skeleton component
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading Dashboard...</div>
      </div>
    );
  }

  // 4. If the code reaches this point, `isAuthenticated` is true, which guarantees
  // that the token exists in the context and can be safely accessed by child components.
  return (
    <DashboardLayout 
      title="Student Dashboard" 
      subtitle={`Welcome back, ${user?.email || 'student'}! Ready to learn?`}
    >
      <div className="max-w-4xl mx-auto">
        <EnhancedChatBot userRole="student" height="h-[calc(100vh-12rem)]" />
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;