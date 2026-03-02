import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User } from '@/types';
import { auth as apiAuth, getStoredToken, setStoredToken, clearStoredToken } from '@/lib/api';

const USER_KEY = 'padel_user';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, firstName?: string, lastName?: string) => Promise<boolean>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<boolean>;
  updateUser: (updates: Pick<User, 'firstName' | 'lastName'>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function userFromApi(api: { id: string; email: string }, firstName?: string, lastName?: string): User {
  return {
    id: api.id,
    email: api.email,
    firstName: firstName ?? '',
    lastName: lastName ?? '',
    createdAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw) as User);
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string, firstName?: string, lastName?: string): Promise<boolean> => {
      try {
        const { user: apiUser, token } = await apiAuth.login(email, password);
        setStoredToken(token);
        const u = userFromApi(apiUser, firstName, lastName);
        setUser(u);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        return true;
      } catch (e) {
        console.warn('Login failed', e);
        return false;
      }
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string, firstName?: string, lastName?: string): Promise<boolean> => {
      try {
        const { user: apiUser, token } = await apiAuth.register(email, password);
        setStoredToken(token);
        const u = userFromApi(apiUser, firstName, lastName);
        setUser(u);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        return true;
      } catch (e) {
        console.warn('Register failed', e);
        return false;
      }
    },
    []
  );

  const updateUser = useCallback((updates: Pick<User, 'firstName' | 'lastName'>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
