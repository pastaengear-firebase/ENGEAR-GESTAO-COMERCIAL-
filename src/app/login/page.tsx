
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
    const justLoggedIn = sessionStorage.getItem(SESSION_STORAGE_LOGIN_FLAG);

    if (!loading && isAuthenticated) {
      if (justLoggedIn) {
        // Se acabou de logar, o AuthContext cuidou do redirect com window.location.assign.
        // Apenas removemos o flag. A página será recarregada de qualquer forma.
        sessionStorage.removeItem(SESSION_STORAGE_LOGIN_FLAG);
      } else {
        // Se já estava autenticado (ex: refresh, bookmark) e não acabou de logar,
        // então a LoginPage redireciona.
        router.replace('/dashboard');
      }
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
  
  // Estado 3: AuthContext carregado, usuário autenticado.
  // Se acabou de logar, window.location.assign está em progresso.
  // Se já estava autenticado, o useEffect acima está redirecionando.
  // Mostra uma mensagem de "Redirecionando" enquanto isso acontece.
  return (
    <div className="flex h-screen items-center justify-center bg-secondary">
      <p className="text-muted-foreground">Redirecionando para o painel...</p>
    </div>
  );
}
