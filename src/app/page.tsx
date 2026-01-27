// src/app/page.tsx
"use client";
import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/common/logo';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_ACCESS_PASSWORD, APP_ACCESS_GRANTED_KEY } from '@/lib/constants';

export default function RootPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Se um usuário já tiver acesso, redirecione-o para o dashboard
    if (sessionStorage.getItem(APP_ACCESS_GRANTED_KEY) === 'true') {
      router.replace('/dashboard');
    } else {
      // Caso contrário, pare de verificar e mostre o formulário de login
      setIsVerifying(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== DEFAULT_ACCESS_PASSWORD) {
      toast({
        title: "Senha Incorreta",
        description: "A senha de acesso está incorreta. Tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!auth) {
      toast({
        title: "Erro de Autenticação",
        description: "Não foi possível conectar ao serviço de autenticação.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Garante uma sessão anônima do Firebase para operações de banco de dados
      await signInAnonymously(auth);
      // Concede acesso para esta sessão do navegador
      sessionStorage.setItem(APP_ACCESS_GRANTED_KEY, 'true');

      toast({
        title: "Acesso Autorizado",
        description: "Bem-vindo ao sistema de controle de vendas.",
      });

      // Redireciona para o dashboard após o sucesso
      router.replace('/dashboard');
    } catch (error) {
      console.error("Erro no login anônimo:", error);
      sessionStorage.removeItem(APP_ACCESS_GRANTED_KEY); // Limpa em caso de falha
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível estabelecer uma sessão segura. Tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  // Mostra um loader enquanto verifica a sessão para evitar um "flash" do formulário de login
  if (isVerifying) {
     return (
        <div className="flex h-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
     );
  }

  // Renderiza a página de login
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
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground pt-4">
          © {new Date().getFullYear()} ENGEAR. Acesso restrito.
        </p>
      </div>
    </div>
  );
}
