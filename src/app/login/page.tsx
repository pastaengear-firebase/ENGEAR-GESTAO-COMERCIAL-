// src/app/login/page.tsx
"use client";
import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/common/logo';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_ACCESS_PASSWORD, APP_ACCESS_GRANTED_KEY } from '@/lib/constants';

export default function LoginPage() {
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // If user hits login page but has a valid session key, send them to dashboard
  useEffect(() => {
    if (sessionStorage.getItem(APP_ACCESS_GRANTED_KEY) === 'true') {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== DEFAULT_ACCESS_PASSWORD) {
      toast({
        title: "Senha Incorreta",
        description: "A senha de acesso está incorreta. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    if (!auth) {
      toast({
        title: "Erro de Autenticação",
        description: "Não foi possível conectar ao serviço de autenticação.",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      // 1. Set the session key to grant access for this session
      sessionStorage.setItem(APP_ACCESS_GRANTED_KEY, 'true');

      // 2. Ensure we have a Firebase anonymous user for database operations.
      // If a user doesn't exist, sign in. If one already does, we can reuse it.
      if (!user) {
        await signInAnonymously(auth);
      }
      
      toast({
        title: "Acesso Autorizado",
        description: "Bem-vindo ao sistema de controle de vendas.",
      });

      // 3. Redirect to the dashboard
      router.replace('/dashboard');

    } catch (error) {
      console.error("Erro no login anônimo:", error);
      // If anything fails, remove the key to prevent being in a weird state
      sessionStorage.removeItem(APP_ACCESS_GRANTED_KEY);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível estabelecer uma sessão segura. Verifique as configurações do Firebase.",
        variant: "destructive",
      });
      setIsLoggingIn(false);
    }
  };
  
  // Do not show a loader here. The purpose of this page is to ask for a password.
  // The protected layout will handle showing a loader while verifying the session.

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm space-y-8 rounded-xl bg-white dark:bg-gray-800 p-8 shadow-lg text-center">
        <div className="flex justify-center">
          <Logo width={250} height={70} />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Acesso ao Sistema de Vendas
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Insira a senha de acesso da equipe.
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha de Acesso"
            required
            className="text-center"
          />
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
            disabled={isLoggingIn || userLoading}
          >
            {isLoggingIn || userLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoggingIn || userLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground pt-4">
          © {new Date().getFullYear()} ENGEAR. Acesso restrito.
        </p>
      </div>
    </div>
  );
}
