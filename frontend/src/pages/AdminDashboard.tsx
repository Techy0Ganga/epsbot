
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import EnhancedChatBot from '@/components/EnhancedChatBot';

const AdminDashboard = () => {
  return (
    <DashboardLayout 
      title="Admin Dashboard" 
      subtitle="AI-powered administrative assistant for platform management"
    >
      <div className="max-w-4xl mx-auto">
        <EnhancedChatBot userRole="admin" height="h-[calc(100vh-12rem)]" />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
