// src/app/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // console.log(`HomePage: loading=${loading}, isAuthenticated=${isAuthenticated}`);
    if (!loading) {
      if (isAuthenticated) {
        // console.log("HomePage: Authenticated, preparing to redirect to /dashboard.");
        // Adiciona um pequeno atraso para tentar dar tempo ao cookie de se propagar
        const timer = setTimeout(() => {
          // console.log("HomePage: Timer expired, redirecting to /dashboard.");
          router.replace('/dashboard');
        }, 100); // Atraso de 100ms
        return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
      } else {
        // console.log("HomePage: Not authenticated, redirecting to /login.");
        router.replace('/login');
      }
    }
  }, [loading, isAuthenticated, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg text-foreground">Carregando aplicação...</p>
    </div>
  );
}
