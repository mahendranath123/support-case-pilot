
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export function UserManagement() {
  const { users, createUser } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const success = await createUser(newUsername, newPassword, newRole);
      if (success) {
        toast({
          title: "User Created",
          description: `User ${newUsername} has been created successfully`,
        });
        setNewUsername('');
        setNewPassword('');
        setNewRole('user');
      } else {
        toast({
          title: "Error",
          description: "Username already exists or creation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New User */}
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
                <Select value={newRole} onValueChange={(value) => setNewRole(value as 'admin' | 'user')}>
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
              {isCreating ? "Creating..." : "Create User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* User List */}
      <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-sm animate-fade-in">
        <CardHeader>
          <CardTitle>Existing Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user, index) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-white/20 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-600">
                      Created: {user.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
