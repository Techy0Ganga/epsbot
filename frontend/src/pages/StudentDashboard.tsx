
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import EnhancedChatBot from '@/components/EnhancedChatBot';

const StudentDashboard = () => {
  return (
    <DashboardLayout 
      title="Student Dashboard" 
      subtitle="Welcome back! Ready to learn something new today?"
    >
      <div className="max-w-4xl mx-auto">
        <EnhancedChatBot userRole="student" height="h-[calc(100vh-12rem)]" />
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
