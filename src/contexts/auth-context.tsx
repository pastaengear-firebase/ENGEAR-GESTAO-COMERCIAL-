// src/contexts/auth-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { 
  LOCAL_STORAGE_AUTH_KEY, 
  DEFAULT_LOGIN_CREDENTIALS, 
  COOKIE_MAX_AGE_SECONDS, 
  EXPIRE_COOKIE_STRING 
} from '@/lib/constants';
import type { AuthState, AuthContextType, User } from '@/lib/types';

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [loading, setLoading] = useState(true); // Start as true

  useEffect(() => {
    // console.log("AuthProvider: Initializing...");
    setLoading(true);
    let newAuthState: AuthState = { isAuthenticated: false, user: null };
    try {
      const cookieAuth = typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('isAuthenticated='))?.split('=')[1] : null;

      if (cookieAuth === 'true') {
        // console.log("AuthProvider: Cookie indicates authenticated.");
        const storedAuthData = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_AUTH_KEY) : null;
        if (storedAuthData) {
          const parsedData: AuthState = JSON.parse(storedAuthData);
          if (parsedData.isAuthenticated && parsedData.user) {
            // console.log("AuthProvider: Loaded user from localStorage:", parsedData.user);
            newAuthState = { isAuthenticated: true, user: parsedData.user };
          } else {
            // Cookie says true, but localStorage is inconsistent or lacks user. Force login.
            // console.log("AuthProvider: Cookie true, but localStorage inconsistent. Forcing re-auth.");
            newAuthState = { isAuthenticated: false, user: null };
            if (typeof localStorage !== 'undefined') localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
            if (typeof document !== 'undefined') document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
          }
        } else {
          // Cookie says true, but no localStorage data. This is unusual. Could be an old cookie.
          // Consider it authenticated for now but with no user details, or force re-auth.
          // Forcing re-auth is safer if user details are essential.
          // console.log("AuthProvider: Cookie true, but no localStorage data. Forcing re-auth.");
          newAuthState = { isAuthenticated: false, user: null };
          if (typeof document !== 'undefined') document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
        }
      } else {
        // console.log("AuthProvider: Cookie indicates not authenticated or missing.");
        newAuthState = { isAuthenticated: false, user: null };
        if (typeof localStorage !== 'undefined') localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
        // Ensure cookie is also cleared if it existed but was not 'true'
        if (typeof document !== 'undefined' && cookieAuth) {
            document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
        }
      }
    } catch (e) {
      console.error("AuthProvider: Error during initialization, defaulting to unauthenticated.", e);
      newAuthState = { isAuthenticated: false, user: null };
      try {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
        if (typeof document !== 'undefined') document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
      } catch (clearError) {
        console.error("AuthProvider: Error clearing storage/cookie after init error.", clearError);
      }
    } finally {
      setAuthState(newAuthState);
      setLoading(false);
      // console.log("AuthProvider: Initialization complete. State:", newAuthState, "Loading:", false);
    }
  }, []);

  const login = useCallback(async (username: string, passwordAttempt: string) => {
    // console.log(`AuthProvider: Login attempt for ${username}`);
    if (
      username === DEFAULT_LOGIN_CREDENTIALS.username &&
      passwordAttempt === DEFAULT_LOGIN_CREDENTIALS.password
    ) {
      const user: User = { username };
      setAuthState({ isAuthenticated: true, user });
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify({ isAuthenticated: true, user }));
        }
        if (typeof document !== 'undefined') {
          document.cookie = `isAuthenticated=true; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
          // console.log("AuthProvider: Login successful, cookie set. Redirecting to /");
          window.location.assign('/'); // Redirect to HomePage
        }
      } catch (e) {
        console.error("AuthProvider: Error setting localStorage/cookie during login", e);
      }
    } else {
      // console.log("AuthProvider: Login failed - invalid credentials.");
      throw new Error('Usuário ou senha inválidos.');
    }
  }, []);

  const logout = useCallback(() => {
    // console.log("AuthProvider: Logout initiated.");
    setAuthState({ isAuthenticated: false, user: null });
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
      }
      if (typeof document !== 'undefined') {
        document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
        // console.log("AuthProvider: Logout complete, cookie cleared. Redirecting to /login");
        window.location.assign('/login');
      }
    } catch (e) {
      console.error("AuthProvider: Error clearing localStorage/cookie during logout", e);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
