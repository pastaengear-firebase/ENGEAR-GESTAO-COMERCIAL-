// src/app/login/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import LoginForm from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // This useEffect handles the "Redirecionando..." message if AuthContext determines
  // the user is already authenticated (e.g., after HomePage redirects here but cookie was set).
  // However, middleware should ideally prevent authenticated users from reaching /login.
  useEffect(() => {
    // console.log(`LoginPage: loading=${loading}, isAuthenticated=${isAuthenticated}`);
    if (!loading && isAuthenticated) {
      // console.log("LoginPage: Already authenticated (unexpectedly), redirecting to /dashboard.");
      // This scenario should be rare if middleware and HomePage logic are correct.
      router.replace('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
     return (
        <div className="flex h-screen items-center justify-center bg-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Verificando autenticação...</p>
        </div>
      );
  }
  
  // If middleware allowed access to /login, and AuthContext is !loading and !isAuthenticated, show form.
  // If !loading and isAuthenticated (e.g. from a race condition or direct navigation), the useEffect above handles redirect.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          {/* Logo foi removido daqui, pois o layout principal o tem no HeaderContent */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Acesso ao Sistema
          </h1>
          <p className="mt-2 text-muted-foreground">
            CONTROLE DE VENDAS – EQUIPE COMERCIAL ENGEAR
          </p>
        </div>
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Insira suas credenciais para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          Problemas para acessar? Contate o administrador.
        </p>
      </div>
    </div>
  );
}
