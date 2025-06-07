// src/components/LoginForm.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Sun, Moon, Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bgShift, setBgShift] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 8;
    const y = (e.clientY / window.innerHeight - 0.5) * 8;
    setBgShift({ x, y });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const ok = await login(username, password);
      if (ok) navigate('/');
      else toast({ title: 'Login failed', description: 'Invalid credentials', variant: 'destructive' });
    } catch {
      toast({ title: 'Error', description: 'Unexpected error', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-700 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800'
          : 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'
      }`}
      style={{ backgroundPosition: `${50 + bgShift.x}% ${50 + bgShift.y}%` }}
    >
      <button
        onClick={() => setIsDarkMode(d => !d)}
        className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 shadow-md hover:shadow-lg transition"
        aria-label="Toggle theme"
      >
        {isDarkMode ? <Sun className="h-6 w-6 text-yellow-300" /> : <Moon className="h-6 w-6 text-white" />}
      </button>

      <div
        className="absolute inset-0 pointer-events-none opacity-20 animate-pulse"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'4\' fill=\'%239C92AC\' fill-opacity=\'0.1\'/%3E%3C/g%3E%3C/svg%3E")',
        }}
      />

      <Card
        className={`w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl z-10 transform transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
        } hover:scale-105`}
        style={{ perspective: '1000px' }}
      >
        <CardHeader className="text-center pt-6 pb-4">
          <div
            className="mx-auto mb-4 w-32 h-32"
            style={{
              transform: `rotateY(${bgShift.x}deg) rotateX(${-bgShift.y}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            <img src="/jeebr.jpg" alt="Jeebr Logo" className="w-full h-full object-contain" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Jeebr Support Tracker</CardTitle>
          <CardDescription className="text-white/80">Technical Support Workflow Management</CardDescription>
        </CardHeader>

        <CardContent className="px-8 pt-2 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="username" className="text-white/90 font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 rounded-lg px-3 py-2 shadow-inner hover:shadow-outline transition"
              />
            </div>

            <div className="space-y-1 relative">
              <Label htmlFor="password" className="text-white/90 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 rounded-lg px-3 py-2 pr-12 shadow-inner hover:shadow-outline transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute inset-y-0 right-3 flex items-center justify-center text-white/70 hover:text-white transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-lg transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

