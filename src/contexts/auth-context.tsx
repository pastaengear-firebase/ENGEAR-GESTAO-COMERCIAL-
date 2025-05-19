// src/contexts/auth-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Still needed for logout
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
  const router = useRouter(); // Still needed for logout

  useEffect(() => {
    setLoading(true);
    let finalAuthState: AuthState = { isAuthenticated: false, user: null };

    // Prioritize cookie for initial auth decision.
    const cookieAuth = document.cookie.split('; ').find(row => row.startsWith('isAuthenticated='));
    const isCookieAuthenticated = cookieAuth ? cookieAuth.split('=')[1] === 'true' : false;

    if (isCookieAuthenticated) {
      // Cookie says "yes". Try to load user data from localStorage.
      const storedAuthData = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
      if (storedAuthData) {
        try {
          const parsedStorageAuth: AuthState = JSON.parse(storedAuthData);
          if (parsedStorageAuth.isAuthenticated && parsedStorageAuth.user) {
            // localStorage agrees and has user data. We are authenticated.
            finalAuthState = parsedStorageAuth;
            // Ensure cookie is refreshed to extend its life if localStorage was the source of truth
            document.cookie = `isAuthenticated=true; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
          } else {
            // Cookie says "yes", but localStorage is invalid or says "no". Desync.
            // Force logout for safety.
            console.warn("AuthContext: Cookie authenticated, but localStorage invalid/disagrees. Forcing logout.");
            localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
            document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
            finalAuthState = { isAuthenticated: false, user: null };
          }
        } catch (error) {
          // localStorage is corrupted. Desync. Force logout.
          console.error("AuthContext: Error parsing localStorage. Forcing logout.", error);
          localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
          document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
          finalAuthState = { isAuthenticated: false, user: null };
        }
      } else {
        // Cookie says "yes", but no localStorage data. Desynchronized state.
        // Force logout to ensure a clean state.
        console.warn("AuthContext: Cookie authenticated, but localStorage empty. Forcing logout for consistency.");
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY); // Ensure localStorage is also cleared
        document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
        finalAuthState = { isAuthenticated: false, user: null };
      }
    } else {
      // Cookie says "no" (or doesn't exist). We are not authenticated.
      // Ensure localStorage is also cleared for consistency.
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
      finalAuthState = { isAuthenticated: false, user: null };
    }

    setAuthState(finalAuthState);
    setLoading(false);
  }, []);

  const login = useCallback((username: string) => {
    const user: User = { username };
    const newAuthState: AuthState = { isAuthenticated: true, user };
    setAuthState(newAuthState); 
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(newAuthState)); 
    document.cookie = `isAuthenticated=true; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    // Use window.location.assign for a "harder" redirect to help with cookie propagation.
    if (typeof window !== "undefined") {
      window.location.assign('/'); 
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({ isAuthenticated: false, user: null }); 
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY); 
    document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
    router.push('/login'); 
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
