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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const [loading, setLoading] = useState(true); // Start with loading true
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    let resolvedAuthState: AuthState = { isAuthenticated: false, user: null };
    let cookieShouldBeSetToTrue = false;

    try {
      const cookieAuth = document.cookie.split('; ').find(row => row.startsWith('isAuthenticated='));
      const isCookieAuthenticated = cookieAuth ? cookieAuth.split('=')[1] === 'true' : false;

      if (isCookieAuthenticated) {
        // Cookie says authenticated. Check localStorage for user data.
        const storedAuthData = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
        if (storedAuthData) {
          const parsedStorageAuth: AuthState = JSON.parse(storedAuthData);
          if (parsedStorageAuth.isAuthenticated && parsedStorageAuth.user) {
            // Both cookie and localStorage agree and have user data.
            resolvedAuthState = parsedStorageAuth;
            cookieShouldBeSetToTrue = true;
          } else {
            // Desync: Cookie true, but localStorage says not authenticated or missing user. Force logout.
            console.warn("AuthContext: Cookie/localStorage desync (localStorage invalid while cookie true). Forcing logout.");
            localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
            // resolvedAuthState remains { isAuthenticated: false, user: null }
            // cookieShouldBeSetToTrue will be false, leading to cookie deletion below.
          }
        } else {
          // Desync: Cookie true, but no localStorage data. Force logout.
          console.warn("AuthContext: Cookie true, localStorage empty. Forcing logout.");
          localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
          // resolvedAuthState remains { isAuthenticated: false, user: null }
        }
      } else {
        // Cookie says not authenticated (or no cookie). Ensure localStorage is also cleared.
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
        // resolvedAuthState remains { isAuthenticated: false, user: null }
      }
    } catch (error) {
      console.error("AuthContext: Error during initial auth state resolution:", error);
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY); // Clear possibly corrupted data
      // resolvedAuthState remains { isAuthenticated: false, user: null }
    }

    // Synchronize cookie based on the resolved state
    if (cookieShouldBeSetToTrue) {
      document.cookie = `isAuthenticated=true; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    } else {
      // Ensure cookie is cleared if resolved state is not authenticated
      document.cookie = 'isAuthenticated=false; path=/; max-age=0; SameSite=Lax'; 
    }

    setAuthState(resolvedAuthState);
    setLoading(false);
  }, []);

  const login = useCallback((username: string) => {
    const user: User = { username };
    const newAuthState: AuthState = { isAuthenticated: true, user };
    setAuthState(newAuthState);
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(newAuthState));
    document.cookie = `isAuthenticated=true; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    setAuthState(initialState);
    localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    document.cookie = 'isAuthenticated=false; path=/; max-age=0; SameSite=Lax'; // Expire immediately
    router.push('/login');
  }, [router]);

  // Removed the direct loading JSX from here. Consumers will use the 'loading' state.
  return (
    <AuthContext.Provider value={{ ...authState, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
