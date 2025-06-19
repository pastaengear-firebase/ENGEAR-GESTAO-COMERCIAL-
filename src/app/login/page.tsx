
// src/app/login/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import LoginForm from '@/components/auth/login-form';
import Logo from '@/components/common/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SESSION_STORAGE_LOGIN_FLAG } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Só tenta redirecionar se o loading terminou e o usuário está autenticado.
    if (!loading && isAuthenticated) {
      const justLoggedIn = sessionStorage.getItem(SESSION_STORAGE_LOGIN_FLAG);
      if (justLoggedIn) {
        sessionStorage.removeItem(SESSION_STORAGE_LOGIN_FLAG); // Limpa o flag após o uso
      }
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    // Estado 1: AuthContext está verificando o estado inicial
    return (
      <div className="flex h-screen items-center justify-center bg-secondary">
        <p className="text-muted-foreground">Verificando autenticação...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Estado 2: AuthContext carregado, usuário não autenticado -> Mostrar formulário
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-background p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="items-center text-center">
            <Logo className="mb-6" />
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
              CONTROLE DE VENDAS
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Equipe Comercial ENGEAR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ENGEAR. Todos os direitos reservados.</p>
        </footer>
      </div>
    );
  }
  
  // Estado 3: AuthContext carregado, usuário autenticado -> useEffect está redirecionando.
  // Mostra uma mensagem de "Redirecionando" enquanto o router.replace faz seu trabalho.
  return (
    <div className="flex h-screen items-center justify-center bg-secondary">
      <p className="text-muted-foreground">Redirecionando para o painel...</p>
    </div>
  );
}
