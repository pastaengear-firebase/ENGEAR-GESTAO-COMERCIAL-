// src/contexts/auth-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { LOCAL_STORAGE_AUTH_KEY, DEFAULT_LOGIN_CREDENTIALS } from '@/lib/constants';
import type { AuthState, AuthContextType, User } from '@/lib/types';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const EXPIRE_COOKIE_STRING = 'Thu, 01 Jan 1970 00:00:00 GMT';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // TEMPORARILY DEFAULTING TO AUTHENTICATED STATE FOR TESTING
    const defaultUser: User = { username: DEFAULT_LOGIN_CREDENTIALS.username };
    setAuthState({ isAuthenticated: true, user: defaultUser });
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify({ isAuthenticated: true, user: defaultUser }));
    if (typeof document !== 'undefined') {
        document.cookie = `isAuthenticated=true; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    }
    setLoading(false);
  }, []);

  const login = useCallback((username: string) => {
    const user: User = { username };
    setAuthState({ isAuthenticated: true, user });
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify({ isAuthenticated: true, user }));
    if (typeof document !== 'undefined') {
        document.cookie = `isAuthenticated=true; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    }
    // Navigation will be handled by HomePage or direct access due to disabled middleware
    // if (typeof window !== "undefined") {
    //   window.location.assign('/'); 
    // }
  }, []);

  const logout = useCallback(() => {
    setAuthState({ isAuthenticated: false, user: null });
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    if (typeof document !== 'undefined') {
        document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
    }
    // Navigation will be handled by HomePage or direct access due to disabled middleware
    // if (typeof window !== "undefined") {
    //  window.location.assign('/login');
    // }
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
