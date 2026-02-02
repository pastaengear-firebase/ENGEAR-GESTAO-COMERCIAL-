
// components/auth/auth-gate.tsx
'use client';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { useSales } from '../../hooks/use-sales';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loadingAuth } = useSales();
  const router = useRouter();
  const pathname = usePathname();
  const lastRedirect = useRef<string | null>(null);

  useEffect(() => {
    if (!loadingAuth && !user && pathname !== '/login') {
      if (lastRedirect.current !== '/login') {
        lastRedirect.current = '/login';
        router.replace('/login');
      }
    }
  }, [user, loadingAuth, router, pathname]);

  if (loadingAuth || (!user && pathname !== '/login')) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
