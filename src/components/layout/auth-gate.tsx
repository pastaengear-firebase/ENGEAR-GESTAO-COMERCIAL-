// src/components/layout/auth-gate.tsx
'use client';

import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const PUBLIC_ROUTES = ['/login', '/signup', '/auth/forgot-password'];
const VERIFY_EMAIL_ROUTE = '/auth/verify-email';
const HOME_ROUTE = '/dashboard';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait until user status is resolved

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isVerifyRoute = pathname === VERIFY_EMAIL_ROUTE;

    if (user) { // Logged in
      if (user.emailVerified) { // Verified
        if (isPublicRoute || isVerifyRoute) {
          router.replace(HOME_ROUTE);
        }
      } else { // Not verified
        if (!isVerifyRoute) {
          router.replace(VERIFY_EMAIL_ROUTE);
        }
      }
    } else { // Not logged in
      if (!isPublicRoute) { 
         router.replace('/login');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Determine if we should render children or a loader while a redirect is pending
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isVerifyRoute = pathname === VERIFY_EMAIL_ROUTE;

  if (user) {
    if (user.emailVerified) {
      // If user is verified but on a public/verify page, show loader while redirecting
      if (isPublicRoute || isVerifyRoute) return (
         <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
         </div>
      );
    } else {
      // If user is not verified and not on the verify page, show loader while redirecting
      if (!isVerifyRoute) return (
         <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
         </div>
      );
    }
  } else {
    // If user is not logged in and on a protected page, show loader while redirecting
    if (!isPublicRoute) return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
  }

  // If no redirection is needed, render the children for the current route
  return <>{children}</>;
}
