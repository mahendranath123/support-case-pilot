
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CaseList } from './CaseList';
import { NewCaseForm } from './NewCaseForm';
import { UserManagement } from './UserManagement';
import { PasswordChange } from './PasswordChange';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Case } from '../types';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [activeTab, setActiveTab] = useState('cases');

  const handleCaseAdded = (newCase: Case) => {
    setCases(prev => [newCase, ...prev]);
  };

  const handleCaseUpdated = (updatedCase: Case) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
  };

  const pendingCount = cases.filter(c => c.status === 'Pending').length;
  const overdueCount = cases.filter(c => c.status === 'Overdue').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Support Tracker</h1>
                <p className="text-sm text-gray-600">Technical Support Workflow Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {pendingCount} Pending
                </Badge>
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  {overdueCount} Overdue
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
                <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                  {user?.role}
                </Badge>
                <Button variant="outline" onClick={logout} size="sm">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-white/80 backdrop-blur-lg">
            <TabsTrigger value="cases" className="transition-all duration-200">Cases</TabsTrigger>
            <TabsTrigger value="new-case" className="transition-all duration-200">New Case</TabsTrigger>
            <TabsTrigger value="settings" className="transition-all duration-200">Settings</TabsTrigger>
            {user?.role === 'admin' && (
              <TabsTrigger value="users" className="transition-all duration-200">Users</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="cases" className="animate-fade-in">
            <CaseList cases={cases} onCaseUpdated={handleCaseUpdated} />
          </TabsContent>

          <TabsContent value="new-case" className="animate-fade-in">
            <NewCaseForm onCaseAdded={handleCaseAdded} />
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <PasswordChange />
          </TabsContent>

          {user?.role === 'admin' && (
            <TabsContent value="users" className="animate-fade-in">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
