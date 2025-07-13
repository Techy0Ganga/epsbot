
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import EnhancedChatBot from '@/components/EnhancedChatBot';

const MentorDashboard = () => {
  return (
    <DashboardLayout 
      title="Mentor Dashboard" 
      subtitle="AI-powered mentoring assistant to support your students"
    >
      <div className="max-w-4xl mx-auto">
        <EnhancedChatBot userRole="mentor" height="h-[calc(100vh-12rem)]" />
      </div>
    </DashboardLayout>
  );
};

export default MentorDashboard;
