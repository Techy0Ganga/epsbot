
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, subtitle }) => {
  const { userInfo, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleColors = {
    student: 'bg-gradient-to-r from-blue-500 to-purple-600',
    mentor: 'bg-gradient-to-r from-green-500 to-teal-600',
    admin: 'bg-gradient-to-r from-orange-500 to-red-600'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Scholar Hub</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-800 hidden lg:block">Scholar Hub</h1>
            <div className="mt-4">
              <div className={`w-12 h-12 rounded-full ${roleColors[userRole!]} flex items-center justify-center mb-3`}>
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">{userInfo?.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{userRole}</p>
              {userInfo?.grade && <p className="text-sm text-gray-500">{userInfo.grade}</p>}
            </div>
          </div>
          
          <div className="p-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
