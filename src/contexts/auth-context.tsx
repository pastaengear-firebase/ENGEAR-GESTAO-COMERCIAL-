// src/contexts/auth-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LOCAL_STORAGE_AUTH_KEY, DEFAULT_LOGIN_CREDENTIALS, EMAIL_RECOVERY_ADDRESS } from '@/lib/constants';
import type { AuthState, AuthContextType, User } from '@/lib/types';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const EXPIRE_COOKIE_STRING = 'Thu, 01 Jan 1970 00:00:00 GMT';

const initialAuthState: AuthState = {
  // Padronizar para autenticado para fins de teste
  isAuthenticated: true,
  user: { username: DEFAULT_LOGIN_CREDENTIALS.username },
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  // Iniciar como 'false' (não carregando) porque estamos forçando o estado autenticado
  const [loading, setLoading] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    // Para fins de teste, forçamos o estado autenticado
    // Isso garante que qualquer componente que dependa do AuthContext
    // veja o usuário como logado.
    console.log("AuthProvider: Forcing authenticated state for testing.");
    const user: User = { username: DEFAULT_LOGIN_CREDENTIALS.username };
    setAuthState({ isAuthenticated: true, user });
    setLoading(false); // Definir loading como false, pois o estado é forçado

    // Opcionalmente, ainda podemos definir localStorage/cookie para consistência se outras partes tentarem lê-los
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify({ isAuthenticated: true, user }));
    }
    if (typeof document !== 'undefined') {
        document.cookie = `isAuthenticated=true; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    }
  }, []);

  const login = useCallback((username: string) => {
    // Em modo de teste, esta função pode não ser chamada ou seu efeito de navegação
    // será sobreposto pelos redirecionamentos forçados.
    console.log(`AuthProvider: Login attempt for ${username} (test mode).`);
    const user: User = { username };
    setAuthState({ isAuthenticated: true, user });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify({ isAuthenticated: true, user }));
    }
    if (typeof document !== 'undefined') {
      document.cookie = `isAuthenticated=true; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    }
    // Não redirecionar daqui, pois a HomePage/LoginPage já está forçando o redirecionamento.
  }, [router]);

  const logout = useCallback(() => {
    // Em modo de teste, esta função pode não ser chamada ou seu efeito de navegação
    // será sobreposto pelos redirecionamentos forçados.
    console.log("AuthProvider: Logout attempt (test mode).");
    setAuthState({ isAuthenticated: false, user: null });
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    }
    if (typeof document !== 'undefined') {
      document.cookie = `isAuthenticated=false; path=/; expires=${EXPIRE_COOKIE_STRING}; SameSite=Lax`;
    }
    // Forçar o redirecionamento para a página de login, embora em modo de teste ela também redirecione.
    if (typeof window !== 'undefined') {
        window.location.assign('/login'); 
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
