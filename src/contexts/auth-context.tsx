// src/contexts/auth-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    let finalAuthState: AuthState = { isAuthenticated: false, user: null };

    const cookieAuth = document.cookie.split('; ').find(row => row.startsWith('isAuthenticated='));
    const isCookieAuthenticated = cookieAuth ? cookieAuth.split('=')[1] === 'true' : false;

    if (isCookieAuthenticated) {
      // Cookie says "yes". Now check localStorage for user data.
      const storedAuthData = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
      if (storedAuthData) {
        try {
          const parsedStorageAuth: AuthState = JSON.parse(storedAuthData);
          if (parsedStorageAuth.isAuthenticated && parsedStorageAuth.user) {
            // localStorage is valid and agrees. We are authenticated.
            finalAuthState = parsedStorageAuth;
          } else {
            // localStorage is invalid or says not authenticated. Desync.
            // Since cookie said "yes", but localStorage is bad, this is a corrupted state. Force logout.
            console.warn("AuthContext: Cookie authenticated, but localStorage invalid. Forcing logout.");
            localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
            document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
            // finalAuthState remains { isAuthenticated: false, user: null }
          }
        } catch (error) {
          // localStorage is corrupted. Desync. Force logout.
          console.error("AuthContext: Error parsing localStorage. Forcing logout.", error);
          localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
          document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
          // finalAuthState remains { isAuthenticated: false, user: null }
        }
      } else {
        // Cookie says "yes", but no localStorage data. Desync. Force logout.
        console.warn("AuthContext: Cookie authenticated, but localStorage empty. Forcing logout.");
        // No need to remove localStorage as it's already empty.
        document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
        // finalAuthState remains { isAuthenticated: false, user: null }
      }
    } else {
      // Cookie says "no" (or doesn't exist). We are not authenticated.
      // Ensure localStorage is also cleared for consistency.
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
      // finalAuthState remains { isAuthenticated: false, user: null }
    }

    setAuthState(finalAuthState);
    setLoading(false);
  }, []);

  const login = useCallback((username: string) => {
    const user: User = { username };
    const newAuthState: AuthState = { isAuthenticated: true, user };
    setAuthState(newAuthState); // Update React state
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(newAuthState)); // Persist to localStorage
    // Set the cookie that the middleware will read
    document.cookie = `isAuthenticated=true; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    router.push('/dashboard'); // Attempt to navigate
  }, [router]);

  const logout = useCallback(() => {
    setAuthState({ isAuthenticated: false, user: null }); // Update React state
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY); // Clear localStorage
    // Clear the cookie
    document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
    router.push('/login'); // Navigate to login
  }, [router]);

  // Removed the direct loading JSX from here. Consumers will use the 'loading' state.
  return (
    <AuthContext.Provider value={{ ...authState, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
