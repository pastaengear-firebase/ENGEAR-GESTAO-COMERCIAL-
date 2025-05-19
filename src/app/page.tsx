// src/app/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth(); // Agora usa o estado de 'loading'
  const router = useRouter();

  useEffect(() => {
    // Se o AuthContext ainda estiver carregando, não faz nada ainda.
    if (loading) {
      return;
    }

    // Agora que o AuthContext carregou, decide para onde redirecionar.
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]); // Adiciona 'loading' às dependências

  // Exibe um loader enquanto o AuthContext está carregando ou durante o redirecionamento.
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg text-foreground">Carregando...</p>
    </div>
  );
}
