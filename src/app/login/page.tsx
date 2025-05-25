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

  // Este useEffect apenas monitora, não redireciona mais ativamente daqui
  // se o usuário já estiver autenticado. A HomePage deve tratar o redirecionamento inicial.
  useEffect(() => {
    // console.log(`LoginPage: loading=${loading}, isAuthenticated=${isAuthenticated}`);
    if (!loading && isAuthenticated) {
      // console.log("LoginPage: AuthContext reports authenticated. HomePage should handle redirect.");
      // Não redirecionar daqui para evitar loops. Se o middleware nos enviou para /login,
      // então o estado do cookie no servidor não está sincronizado.
      // Forçar um redirecionamento para /dashboard daqui pode recriar o loop.
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
  
  // Se o middleware permitiu o acesso a /login, e AuthContext não está carregando 
  // e não está autenticado, mostre o formulário.
  // Se !loading e isAuthenticated (o que seria inesperado aqui se o middleware estiver funcionando),
  // ainda mostraremos o formulário para quebrar o ciclo, permitindo uma nova tentativa de login.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
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
