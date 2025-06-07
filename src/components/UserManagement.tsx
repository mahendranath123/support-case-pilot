// src/components/UserManagement.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

// Define the shape of a User object (matches what your backend returns)
interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export function UserManagement() {
  const { user, token } = useAuth(); // assume `useAuth` returns both `user` and `token` (if you have auth)
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [isCreating, setIsCreating] = useState(false);

  // You can override this via VITE_API_BASE_URL in your .env (e.g. VITE_API_BASE_URL=http://localhost:3001)
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL?.toString().replace(/\/$/, '') ||
    'http://localhost:3001';

  // ─── 1) Fetch all existing users on component mount ────────────────────────────
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch(`${API_BASE}/api/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // If you are using a Bearer token, uncomment the line below:
            // Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
        const data: User[] = await response.json();
        setUsers(data);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        toast({
          title: 'Error',
          description: 'Failed to load existing users.',
          variant: 'destructive',
        });
      }
    }

    fetchUsers();
  }, [API_BASE, token]);

  // ─── 2) Handle “Create New User” form submission ───────────────────────────────
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const resp = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If using a Bearer token:
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          role: newRole,
        }),
      });

      if (resp.status === 409) {
        // Username already exists
        toast({
          title: 'Error',
          description: 'Username already exists',
          variant: 'destructive',
        });
      } else if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Unknown error');
      } else {
        const createdUser: User = await resp.json();
        toast({
          title: 'User Created',
          description: `User ${createdUser.username} created successfully`,
        });
        // Add the new user to the top of the list:
        setUsers((prev) => [createdUser, ...prev]);
        setNewUsername('');
        setNewPassword('');
        setNewRole('user');
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      toast({
        title: 'Error',
        description: 'Failed to create user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // ─── 3) Handle deleting a user (only if you are admin) ────────────────────────
  const handleDeleteUser = async (userId: number) => {
    if (user?.role !== 'admin') {
      toast({
        title: 'Unauthorized',
        description: 'Only admins can delete users.',
        variant: 'destructive',
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user #${userId}?`)) {
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // If using a Bearer token:
          // Authorization: `Bearer ${token}`,
        },
      });
      if (resp.status === 404) {
        toast({
          title: 'Error',
          description: 'User not found or already deleted',
          variant: 'destructive',
        });
      } else if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Unknown error');
      } else {
        toast({
          title: 'Deleted',
          description: `User #${userId} has been deleted`,
        });
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── “Create New User” Form ─────────────────────────────────────────────── */}
      <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-sm animate-fade-in">
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newUsername">Username</Label>
                <Input
                  id="newUsername"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newRole">Role</Label>
                <Select
                  value={newRole}
                  onValueChange={(val) => setNewRole(val as 'admin' | 'user')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
            >
              {isCreating ? 'Creating...' : 'Create User'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ─── Existing Users List ─────────────────────────────────────────────────── */}
      <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-sm animate-fade-in">
        <CardHeader>
          <CardTitle>Existing Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length > 0 ? (
              users.map((u, idx) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-white/20 animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {u.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{u.username}</p>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                      {u.role}
                    </Badge>
                    {user?.role === 'admin' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No users found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

