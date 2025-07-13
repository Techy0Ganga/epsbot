
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserCheck, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Access your learning dashboard and AI tutor',
      icon: User,
      color: 'bg-gradient-to-br from-blue-500 to-purple-600',
      loginRoute: '/student-login'
    },
    {
      id: 'mentor',
      title: 'Mentor',
      description: 'Monitor student progress and provide guidance',
      icon: UserCheck,
      color: 'bg-gradient-to-br from-green-500 to-teal-600',
      loginRoute: '/mentor-login'
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Manage platform and view analytics',
      icon: Settings,
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
      loginRoute: '/admin-login'
    }
  ];

  const handleRoleSelect = (loginRoute: string) => {
    navigate(loginRoute);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Scholar Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your AI-powered learning companion for students, mentors, and administrators
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card 
                key={role.id} 
                className="cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0"
                onClick={() => handleRoleSelect(role.loginRoute)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-20 h-20 rounded-full ${role.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {role.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                  >
                    Login as {role.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;
