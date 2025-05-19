// src/app/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { loading } = useAuth(); // AuthContext loading still relevant for its internal setup
  const router = useRouter();

  useEffect(() => {
    // If AuthContext is still doing its initial setup (even if we force auth later), wait.
    if (loading) {
      return;
    }

    // TEMPORARILY REDIRECTING ALWAYS TO DASHBOARD FOR TESTING
    router.replace('/dashboard');
    
  }, [loading, router]);

  // Exibe um loader enquanto o AuthContext está carregando ou durante o redirecionamento.
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg text-foreground">Carregando aplicação...</p>
    </div>
  );
}
