// src/app/login/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
// Não vamos mais importar LoginForm ou useAuth aqui, pois esta página apenas redirecionará

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Forçar redirecionamento para /dashboard para fins de teste
    // Se o usuário de alguma forma chegar a esta página, ele será redirecionado.
    console.log("LoginPage: Forcing redirect to /dashboard for testing.");
    router.replace('/dashboard');
  }, [router]);

  // Exibe um loader enquanto o redirecionamento está ocorrendo.
  return (
    <div className="flex h-screen items-center justify-center bg-secondary">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-3 text-muted-foreground">Redirecionando para o painel...</p>
    </div>
  );
}
