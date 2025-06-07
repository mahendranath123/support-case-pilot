// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

//
// 1) TYPE DEFINITIONS
//
interface RawUserFromServer {
  id: number;
  username: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  createdAt?: Date;
}

interface AuthContextValue {
  // Current logged-in user (or null if not logged in)
  user: User | null;

  // HTTP headers needed for authenticated requests (cases, etc.)
  getAuthHeaders: () => { 'x-user-id': string; 'x-user-role': string };

  // Log in (POST /api/auth/login)
  login: (username: string, password: string) => Promise<boolean>;

  // Log out locally (and clear state)
  logout: () => void;

  // List of all users (admin only)
  users: User[];
  fetchUsers: () => Promise<void>;

  // Admin-only CRUD
  createUser: (
    username: string,
    password: string,
    role: 'admin' | 'user'
  ) => Promise<boolean>;
  updateUser: (
    id: number,
    data: { username?: string; password?: string; role?: 'admin' | 'user' }
  ) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

//
// 2) PROVIDER
//
export function AuthProvider({ children }: { children: ReactNode }) {
  // (a) Store logged-in user
  const [user, setUser] = useState<User | null>(null);

  // (b) Store list of all users (admin panel)
  const [users, setUsers] = useState<User[]>([]);

  // Utility: parse RawUserFromServer → User
  function parseUser(raw: RawUserFromServer): User {
    return {
      id: raw.id,
      username: raw.username,
      role: raw.role,
      createdAt: raw.createdAt ? new Date(raw.createdAt) : undefined,
    };
  }

  // Base API URL (Vite proxy or production)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

  //
  // Return headers for authenticated requests (cases, etc.)
  //
  function getAuthHeaders(): { 'x-user-id': string; 'x-user-role': string } {
    if (!user) {
      return { 'x-user-id': '', 'x-user-role': '' };
    }
    return {
      'x-user-id': String(user.id),
      'x-user-role': user.role,
    };
  }

  //
  //  login(): POST /api/auth/login
  //
  async function login(username: string, password: string): Promise<boolean> {
    try {
      const resp = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!resp.ok) {
        return false;
      }

      // Expecting { message: "...", user: { id, username, role, createdAt? } }
      const body = await resp.json();
      if (!body.user) {
        console.error('Login response did not include user:', body);
        return false;
      }

      // Set the logged-in user in state
      const parsed: User = parseUser(body.user);
      setUser(parsed);

      // Persist to localStorage for rehydration
      localStorage.setItem('loggedInUser', JSON.stringify(body.user));

      // If admin, fetch the full users list
      if (parsed.role === 'admin') {
        await fetchUsersInternal();
      }

      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  }

  //
  //  logout(): clear user and users list (and remove from localStorage)
  //
  function logout() {
    setUser(null);
    setUsers([]);
    localStorage.removeItem('loggedInUser');
  }

  //
  //  fetchUsers() → GET /api/users
  //  (frontend-only guard: admin required)
  //
  async function fetchUsers(): Promise<void> {
    if (!user || user.role !== 'admin') {
      console.warn('fetchUsers() called but not admin');
      setUsers([]);
      return;
    }
    await fetchUsersInternal();
  }

  //
  //  createUser() → POST /api/users
  //  (frontend-only guard: admin required)
  //
  async function createUser(
    username: string,
    password: string,
    role: 'admin' | 'user'
  ): Promise<boolean> {
    if (!user || user.role !== 'admin') {
      console.warn('createUser() called but not admin');
      return false;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ username, password, role }),
      });

      if (resp.status === 201) {
        // Refresh the list after creation
        await fetchUsersInternal();
        return true;
      } else {
        console.error('createUser failed, status=', resp.status, await resp.text());
        return false;
      }
    } catch (err) {
      console.error('createUser error:', err);
      return false;
    }
  }

  //
  //  updateUser() → PUT /api/users/:id
  //  (frontend-only guard: admin required)
  //
  async function updateUser(
    id: number,
    data: { username?: string; password?: string; role?: 'admin' | 'user' }
  ): Promise<boolean> {
    if (!user || user.role !== 'admin') {
      console.warn('updateUser() called but not admin');
      return false;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (resp.ok) {
        // Refresh after update
        await fetchUsersInternal();
        return true;
      } else {
        console.error('updateUser failed, status=', resp.status, await resp.text());
        return false;
      }
    } catch (err) {
      console.error('updateUser error:', err);
      return false;
    }
  }

  //
  //  deleteUser() → DELETE /api/users/:id
  //  (frontend-only guard: admin required)
  //
  async function deleteUser(id: number): Promise<boolean> {
    if (!user || user.role !== 'admin') {
      console.warn('deleteUser() called but not admin');
      return false;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (resp.status === 204) {
        // Refresh after deletion
        await fetchUsersInternal();
        return true;
      } else {
        console.error('deleteUser failed, status=', resp.status, await resp.text());
        return false;
      }
    } catch (err) {
      console.error('deleteUser error:', err);
      return false;
    }
  }

  //
  //  Internal helper: fetch /api/users
  //
  async function fetchUsersInternal(): Promise<void> {
    try {
      const resp = await fetch(`${API_BASE}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (!resp.ok) {
        console.error('Failed to fetch users:', resp.statusText);
        setUsers([]);
        return;
      }

      const data: RawUserFromServer[] = await resp.json();
      setUsers(data.map(parseUser));
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  }

  //
  //  Effect: On mount, rehydrate a “logged-in user” from localStorage
  //
  useEffect(() => {
    const saved = localStorage.getItem('loggedInUser');
    if (saved) {
      try {
        const raw: RawUserFromServer = JSON.parse(saved);
        setUser({
          id: raw.id,
          username: raw.username,
          role: raw.role,
          createdAt: raw.createdAt ? new Date(raw.createdAt) : undefined,
        });
      } catch {
        localStorage.removeItem('loggedInUser');
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        getAuthHeaders,
        login,
        logout,
        users,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

//
// 3) Custom hook for easier consumption
//
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

