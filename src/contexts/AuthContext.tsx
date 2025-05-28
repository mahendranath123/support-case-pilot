
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  createUser: (username: string, password: string, role: "admin" | "user") => Promise<boolean>;
  users: User[];
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data - In real app, this would be in your database
const mockUsers = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' as const, createdAt: new Date() },
  { id: '2', username: 'support1', password: 'support123', role: 'user' as const, createdAt: new Date() }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Convert createdAt string back to Date object
      parsedUser.createdAt = new Date(parsedUser.createdAt);
      setUser(parsedUser);
    }
    
    // Load users (without passwords for security)
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      // Convert createdAt strings back to Date objects
      const usersWithDates = parsedUsers.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt)
      }));
      setUsers(usersWithDates);
    } else {
      const usersWithoutPasswords = mockUsers.map(({ password, ...user }) => user);
      setUsers(usersWithoutPasswords);
      localStorage.setItem('users', JSON.stringify(usersWithoutPasswords));
      localStorage.setItem('userCredentials', JSON.stringify(mockUsers));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const credentials = JSON.parse(localStorage.getItem('userCredentials') || '[]');
    const foundUser = credentials.find((u: any) => u.username === username && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      // Ensure createdAt is a Date object
      userWithoutPassword.createdAt = new Date(userWithoutPassword.createdAt);
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    
    const credentials = JSON.parse(localStorage.getItem('userCredentials') || '[]');
    const userIndex = credentials.findIndex((u: any) => u.id === user.id);
    
    if (userIndex !== -1 && credentials[userIndex].password === oldPassword) {
      credentials[userIndex].password = newPassword;
      localStorage.setItem('userCredentials', JSON.stringify(credentials));
      return true;
    }
    return false;
  };

  const createUser = async (username: string, password: string, role: "admin" | "user"): Promise<boolean> => {
    if (user?.role !== 'admin') return false;
    
    const credentials = JSON.parse(localStorage.getItem('userCredentials') || '[]');
    const existingUser = credentials.find((u: any) => u.username === username);
    
    if (existingUser) return false;
    
    const newUser = {
      id: Date.now().toString(),
      username,
      password,
      role,
      createdAt: new Date()
    };
    
    credentials.push(newUser);
    localStorage.setItem('userCredentials', JSON.stringify(credentials));
    
    const { password: _, ...userWithoutPassword } = newUser;
    const updatedUsers = [...users, userWithoutPassword];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      changePassword,
      createUser,
      users,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
