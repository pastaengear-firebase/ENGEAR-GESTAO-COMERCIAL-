
// src/contexts/auth-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import {
  LOCAL_STORAGE_AUTH_KEY,
  DEFAULT_LOGIN_CREDENTIALS,
  COOKIE_MAX_AGE_SECONDS,
  EXPIRE_COOKIE_STRING,
  SESSION_STORAGE_LOGIN_FLAG // Importar a nova constante
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
    console.log("AuthProvider: Initializing...");
    setLoading(true);
    let newAuthState: AuthState = { isAuthenticated: false, user: null };
    let justLoggedInFlag = false;

    try {
      if (typeof sessionStorage !== 'undefined') {
        const flag = sessionStorage.getItem(SESSION_STORAGE_LOGIN_FLAG);
        if (flag === 'true') {
          justLoggedInFlag = true;
          sessionStorage.removeItem(SESSION_STORAGE_LOGIN_FLAG); // Use o sinalizador apenas uma vez
          console.log("AuthProvider: 'justLoggedIn' flag found and removed.");
        }
      }

      if (justLoggedInFlag) {
        console.log("AuthProvider: 'justLoggedIn' flag is true. Assuming authenticated and attempting to set cookie again.");
        const user: User = { username: DEFAULT_LOGIN_CREDENTIALS.username }; // Assumir usuário padrão após login
        newAuthState = { isAuthenticated: true, user };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify({ isAuthenticated: true, user }));
          console.log("AuthProvider (justLoggedIn): User data saved to localStorage.");
        }
        if (typeof document !== 'undefined') {
          document.cookie = `isAuthenticated=true; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
          console.log("AuthProvider (justLoggedIn): isAuthenticated=true cookie re-set.");
        }
      } else {
        console.log("AuthProvider: No 'justLoggedIn' flag. Checking cookie for authentication.");
        const cookieAuth = typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('isAuthenticated='))?.split('=')[1] : null;

        if (cookieAuth === 'true') {
          console.log("AuthProvider: Cookie indicates authenticated.");
          const storedAuthData = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_AUTH_KEY) : null;
          if (storedAuthData) {
            const parsedData: AuthState = JSON.parse(storedAuthData);
            if (parsedData.isAuthenticated && parsedData.user) {
              console.log("AuthProvider: Loaded user from localStorage:", parsedData.user);
              newAuthState = { isAuthenticated: true, user: parsedData.user };
            } else {
              console.warn("AuthProvider: Cookie true, but localStorage inconsistent. Forcing re-auth by clearing cookie.");
              newAuthState = { isAuthenticated: false, user: null };
              if (typeof localStorage !== 'undefined') localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
              if (typeof document !== 'undefined') document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
            }
          } else {
            console.warn("AuthProvider: Cookie true, but no localStorage data. Forcing re-auth by clearing cookie.");
            newAuthState = { isAuthenticated: false, user: null }; // Force re-auth if user data missing
            if (typeof document !== 'undefined') document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
          }
        } else {
          console.log("AuthProvider: Cookie indicates not authenticated or missing. Ensuring clean state.");
          newAuthState = { isAuthenticated: false, user: null };
          if (typeof localStorage !== 'undefined') localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
          if (typeof document !== 'undefined' && cookieAuth) {
              document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
          }
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
      console.log("AuthProvider: Initialization complete. State:", newAuthState, "Loading:", false);
    }
  }, []);

  const login = useCallback(async (username: string, passwordAttempt: string) => {
    console.log(`AuthProvider: Login attempt for ${username}`);
    if (
      username === DEFAULT_LOGIN_CREDENTIALS.username &&
      passwordAttempt === DEFAULT_LOGIN_CREDENTIALS.password
    ) {
      const user: User = { username };
      setAuthState({ isAuthenticated: true, user });
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify({ isAuthenticated: true, user }));
          console.log("AuthProvider: User data saved to localStorage on login.");
        }
        if (typeof document !== 'undefined') {
          document.cookie = `isAuthenticated=true; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
          console.log("AuthProvider: isAuthenticated=true cookie set on login.");
        }
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(SESSION_STORAGE_LOGIN_FLAG, 'true');
          console.log("AuthProvider: 'justLoggedIn' flag set in sessionStorage.");
        }
        console.log("AuthProvider: Login successful. Redirecting to / via window.location.assign.");
        window.location.assign('/');
      } catch (e) {
        console.error("AuthProvider: Error setting storage/cookie during login", e);
        // Reverter estado em caso de erro ao definir armazenamento/cookie
        setAuthState({ isAuthenticated: false, user: null });
        throw new Error('Falha ao configurar a sessão de login.');
      }
    } else {
      console.log("AuthProvider: Login failed - invalid credentials.");
      throw new Error('Usuário ou senha inválidos.');
    }
  }, []);

  const logout = useCallback(() => {
    console.log("AuthProvider: Logout initiated.");
    setAuthState({ isAuthenticated: false, user: null });
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
        console.log("AuthProvider: localStorage cleared on logout.");
      }
      if (typeof document !== 'undefined') {
        document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
        console.log("AuthProvider: isAuthenticated cookie cleared on logout.");
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(SESSION_STORAGE_LOGIN_FLAG);
        console.log("AuthProvider: 'justLoggedIn' flag removed from sessionStorage on logout.");
      }
      console.log("AuthProvider: Logout complete. Redirecting to /login via window.location.assign.");
      window.location.assign('/login');
    } catch (e) {
      console.error("AuthProvider: Error clearing storage/cookie during logout", e);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
