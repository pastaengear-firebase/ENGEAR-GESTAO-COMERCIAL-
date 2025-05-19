// src/app/login/page.tsx
"use client";
import LoginForm from '@/components/auth/login-form';
import Logo from '@/components/common/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This effect handles redirection IF ALREADY AUTHENTICATED and not loading.
    // The middleware should typically handle redirecting from /login if authenticated via cookie.
    // This client-side redirect is a fallback or handles cases where direct navigation to /login occurs
    // while the client-side AuthContext still believes the user is authenticated.
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  // If AuthContext is still determining the auth state, show a loading message.
  if (loading) {
     return (
      <div className="flex h-screen items-center justify-center bg-secondary">
        <p className="text-muted-foreground">Verificando autenticação...</p>
      </div>
    );
  }

  // If AuthContext has loaded AND the user is authenticated,
  // it means the useEffect above will trigger a redirect.
  // While that redirect is happening, we can show a message or loader.
  // This state should be brief.
  if (isAuthenticated) { 
     return (
      <div className="flex h-screen items-center justify-center bg-secondary">
        <p className="text-muted-foreground">Redirecionando para o painel...</p>
      </div>
    );
  }

  // If AuthContext has loaded and the user is NOT authenticated, render the login form.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="mb-8">
        <Logo width={180} height={60} />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Bem-vindo!</CardTitle>
          <CardDescription>CONTROLE DE VENDAS – EQUIPE COMERCIAL ENGEAR</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
       <p className="mt-6 text-center text-sm text-muted-foreground">
        Esqueceu a senha?{' '}
        <a
          href="mailto:pastaengear@gmail.com?subject=Recuperação de Senha - Controle de Vendas ENGEAR"
          className="font-medium text-primary hover:underline"
        >
          Recuperar via E-mail
        </a>
      </p>
    </div>
  );
}
