// src/components/layout/auth-gate.tsx
'use client';

import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

const PUBLIC_ROUTES = ['/login', '/signup', '/auth/forgot-password'];
const VERIFY_EMAIL_ROUTE = '/auth/verify-email';
const HOME_ROUTE = '/dashboard';

const GlobalLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isVerifyRoute = pathname === VERIFY_EMAIL_ROUTE;

    let shouldRedirect = false;
    let targetRoute = '';

    if (!user) { // Not logged in
      if (!isPublicRoute) {
        shouldRedirect = true;
        targetRoute = '/login';
      }
    } else { // Logged in
      if (!user.emailVerified) { // Not verified
        if (!isVerifyRoute) {
          shouldRedirect = true;
          targetRoute = VERIFY_EMAIL_ROUTE;
        }
      } else { // Verified
        if (isPublicRoute || isVerifyRoute) {
          shouldRedirect = true;
          targetRoute = HOME_ROUTE;
        }
      }
    }

    if (shouldRedirect && pathname !== targetRoute) {
      setIsRouting(true);
      router.replace(targetRoute);
    } else {
      setIsRouting(false);
    }
  }, [authLoading, user, pathname, router]);

  if (authLoading || isRouting) {
    return <GlobalLoader />;
  }

  return <>{children}</>;
}
