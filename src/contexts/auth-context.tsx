// src/contexts/auth-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { LOCAL_STORAGE_AUTH_KEY } from '@/lib/constants';
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
    let newAuthState: AuthState;
    const cookieAuthValue = document.cookie.split('; ').find(row => row.startsWith('isAuthenticated='));
    const isCookieAuthenticated = cookieAuthValue ? cookieAuthValue.split('=')[1] === 'true' : false;

    if (isCookieAuthenticated) {
      // Cookie diz que está autenticado. Esta é nossa principal fonte de verdade.
      let userFromStorage: User | null = null;
      const storedAuthData = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
      if (storedAuthData) {
        try {
          const parsedData: AuthState = JSON.parse(storedAuthData);
          // Se o localStorage também diz autenticado e tem um usuário, use esse usuário.
          if (parsedData.isAuthenticated && parsedData.user) {
            userFromStorage = parsedData.user;
          }
        } catch (e) {
          // localStorage corrompido, será sobrescrito.
          localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
        }
      }
      newAuthState = { isAuthenticated: true, user: userFromStorage };
      // Garante que o localStorage reflita o estado autenticado do cookie.
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(newAuthState));
    } else {
      // Cookie indica não autenticado (ou não existe).
      newAuthState = { isAuthenticated: false, user: null };
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
      // Garante explicitamente que o cookie também seja limpo se existia, mas não era 'true'.
      if (cookieAuthValue) {
         document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
      }
    }
    
    setAuthState(newAuthState);
    setLoading(false);
  }, []);

  const login = useCallback((username: string) => {
    const user: User = { username };
    // Atualiza o estado do React primeiro
    setAuthState({ isAuthenticated: true, user });
    // Atualiza o localStorage
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify({ isAuthenticated: true, user }));
    // Define o cookie
    document.cookie = `isAuthenticated=true; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    
    // Força um recarregamento completo da página para a raiz
    if (typeof window !== "undefined") {
      window.location.assign('/'); 
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({ isAuthenticated: false, user: null });
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
    
    if (typeof window !== "undefined") {
      window.location.assign('/login');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

