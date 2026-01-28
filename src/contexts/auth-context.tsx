// src/contexts/auth-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CORRECT_PASSWORD = '1313';
const SESSION_STORAGE_KEY = 'isAuthenticated';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
        const storedAuth = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (storedAuth === 'true') {
            setIsAuthenticated(true);
        }
    } catch (error) {
        console.error("Could not access session storage:", error);
    }
    setLoading(false);
  }, []);

  const login = useCallback((password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      } catch (error) {
         console.error("Could not set session storage:", error);
      }
      setIsAuthenticated(true);
      router.replace('/dashboard');
      return true;
    }
    return false;
  }, [router]);

  const logout = useCallback(() => {
    try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
        console.error("Could not remove from session storage:", error);
    }
    setIsAuthenticated(false);
    router.replace('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
