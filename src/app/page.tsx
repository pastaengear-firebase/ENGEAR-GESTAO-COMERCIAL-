// src/app/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { APP_ACCESS_GRANTED_KEY } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // This component's only job is to redirect based on the session access key.
    // It should not handle any Firebase logic.
    const accessGranted = sessionStorage.getItem(APP_ACCESS_GRANTED_KEY) === 'true';
    if (accessGranted) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg text-foreground">Carregando...</p>
    </div>
  );
}
