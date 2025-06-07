// src/components/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CaseList } from './CaseList';
import { NewCaseForm } from './NewCaseForm';
import { UserManagement } from './UserManagement';
import { Insert } from './Insert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCases } from '@/hooks/useCases';
import { Sun, Moon } from 'lucide-react';
import { Case } from '@/types';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'cases' | 'new-case' | 'users' | 'insert'>('cases');
  const { data: cases = [], isLoading, error } = useCases();
  const pendingCount = cases.filter(c => c.status === 'Pending').length;
  const overdueCount = cases.filter(c => c.status === 'Overdue').length;

  // Dark/light mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Parallax background state
  const [bgShift, setBgShift] = useState({ x: 50, y: 50 });
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const x = 50 - (e.clientX / window.innerWidth) * 30;
      const y = 50 - (e.clientY / window.innerHeight) * 30;
      setBgShift({ x, y });
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <div className="text-center animate-pulse">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Loading cases...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 dark:text-red-400 text-lg">Error loading data</p>
        <p className="text-gray-600 dark:text-gray-300">Please check your backend connection</p>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
      style={{ backgroundPosition: `${bgShift.x}% ${bgShift.y}%` }}
    >
      {/* Header with logo and theme toggle */}
      <header className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-700 shadow-lg z-20 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden transform hover:scale-110 transition">
            <img src="/jeebr.jpg" alt="Jeebr Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Jeebr Support Tracker</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Technical Support Workflow Management</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsDarkMode(d => !d)}
            className="p-2 rounded-full bg-white/20 dark:bg-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-700/30 transition"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-6 w-6 text-yellow-300" /> : <Moon className="h-6 w-6 text-white" />}
          </button>

          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 animate-pulse">
            {pendingCount} Pending
          </Badge>
          <Badge variant="destructive" className="bg-red-100 text-red-800 animate-pulse">
            {overdueCount} Overdue
          </Badge>
          <span className="text-sm text-gray-600 dark:text-gray-300">Welcome, <span className="font-semibold">{user?.username}</span></span>
          <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="cursor-default">
            {user?.role}
          </Badge>
          <Button variant="outline" size="sm" onClick={logout} className="hover:scale-105 transition">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`${user?.role === 'admin' ? 'grid-cols-4' : 'grid-cols-2'} grid w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg overflow-hidden`}>
            <TabsTrigger value="cases" className="transition hover:bg-blue-100 dark:hover:bg-gray-700">Cases</TabsTrigger>
            <TabsTrigger value="new-case" className="transition hover:bg-blue-100 dark:hover:bg-gray-700">New Case</TabsTrigger>
            {user?.role === 'admin' && <TabsTrigger value="users" className="transition hover:bg-blue-100 dark:hover:bg-gray-700">Users</TabsTrigger>}
            {user?.role === 'admin' && <TabsTrigger value="insert" className="transition hover:bg-blue-100 dark:hover:bg-gray-700">Insert</TabsTrigger>}
          </TabsList>

          <TabsContent value="cases" className="animate-fade-in-up">
            <CaseList cases={cases} />
          </TabsContent>
          <TabsContent value="new-case" className="animate-fade-in-up">
            <NewCaseForm onCaseAdded={() => {}} />
          </TabsContent>
          {user?.role === 'admin' && <TabsContent value="users" className="animate-fade-in-up"><UserManagement /></TabsContent>}
          {user?.role === 'admin' && <TabsContent value="insert" className="animate-fade-in-up"><Insert /></TabsContent>}
        </Tabs>
      </main>
    </div>
  );
}

