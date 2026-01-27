// src/app/login/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import Logo from '@/components/common/logo';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // Lidar com o redirecionamento após o login do Google
  useEffect(() => {
    if (!auth || user) return; // Se não houver auth ou já houver usuário, não faz nada

    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // Login bem-sucedido via redirecionamento
          toast({
            title: "Login Bem-Sucedido",
            description: `Bem-vindo de volta, ${result.user.displayName}!`,
          });
          router.replace('/dashboard');
        }
      })
      .catch((error) => {
        console.error("Erro no resultado do redirecionamento de login:", error);
        toast({
          title: "Erro de Login",
          description: "Não foi possível completar o login com o Google. Tente novamente.",
          variant: "destructive",
        });
      });
  }, [auth, router, toast, user]);

  // Se o usuário já estiver logado, redirecionar para o dashboard
  useEffect(() => {
    if (!userLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, userLoading, router]);

  const handleLogin = () => {
    if (!auth) {
      toast({
        title: "Erro de Configuração",
        description: "O serviço de autenticação não está disponível.",
        variant: "destructive",
      });
      return;
    }
    const provider = new GoogleAuthProvider();
    // Inicia o processo de login via redirecionamento
    signInWithRedirect(auth, provider);
  };

  // Enquanto verifica o status do usuário, mostra um loader
  if (userLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Verificando credenciais...</p>
      </div>
    );
  }

  // Se não estiver carregando e não houver usuário, mostra a página de login
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-gray-800 p-8 shadow-lg text-center">
        <div className="flex justify-center">
            <Logo width={250} height={70}/>
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Acesso ao Sistema de Vendas
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Use sua conta Google para entrar.
          </p>
        </div>
        <Button
          onClick={handleLogin}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
        >
           <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 265.8 0 129.5 109.8 20 244 20c74.3 0 134.3 29.3 179.3 71.9l-63.5 61.9C334.4 135.9 292.8 112 244 112c-88.8 0-160.1 71.1-160.1 153.8 0 82.7 71.3 153.8 160.1 153.8 97.2 0 130.2-72.2 134-109.3H244v-75.9h244.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
           Entrar com Google
        </Button>
         <p className="text-xs text-muted-foreground pt-4">
            © {new Date().getFullYear()} ENGEAR. Acesso restrito.
        </p>
      </div>
    </div>
  );
}
