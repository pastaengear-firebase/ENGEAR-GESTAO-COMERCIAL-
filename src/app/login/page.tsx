// src/app/login/page.tsx
"use client";
import LoginForm from '@/components/auth/login-form';
import Logo from '@/components/common/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const { loading } = useAuth(); // Apenas o estado de carregamento é necessário aqui

  // Se o AuthContext ainda estiver determinando o estado de autenticação, mostra uma mensagem de carregamento.
  if (loading) {
     return (
      <div className="flex h-screen items-center justify-center bg-secondary">
        <p className="text-muted-foreground">Verificando autenticação...</p>
      </div>
    );
  }

  // Se o AuthContext carregou (loading: false), a página de login sempre renderiza o formulário.
  // A HomePage (`/`) e o middleware são responsáveis por direcionar o usuário
  // para o dashboard se ele já estiver autenticado. Se ele chegou aqui,
  // o middleware (baseado em cookie) provavelmente já decidiu que ele não está autenticado.
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
