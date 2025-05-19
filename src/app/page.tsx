// src/app/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Forçar redirecionamento para /dashboard para fins de teste
    console.log("HomePage: Forcing redirect to /dashboard for testing.");
    router.replace('/dashboard');
  }, [router]);

  // Exibe um loader enquanto o redirecionamento está ocorrendo.
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg text-foreground">Redirecionando para o painel...</p>
    </div>
  );
}
