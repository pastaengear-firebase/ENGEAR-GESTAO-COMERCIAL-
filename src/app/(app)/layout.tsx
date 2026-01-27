// src/app/(app)/layout.tsx
"use client";
import type React from 'react';
import { useState, useEffect } from 'react';
import SidebarNav from '@/components/layout/sidebar-nav';
import HeaderContent from '@/components/layout/header-content';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { APP_ACCESS_GRANTED_KEY } from '@/lib/constants';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // This check is the single source of truth for whether the user can see the app content.
    // It runs on the client after the component mounts.
    const accessGranted = sessionStorage.getItem(APP_ACCESS_GRANTED_KEY) === 'true';

    if (!accessGranted) {
      // If the password was never entered in this session, redirect to the root login page.
      router.replace('/');
    } else {
      // If the password was entered, authorize the view.
      setIsAuthorized(true);
    }
  }, [router]);


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // While checking for authorization, show a loader.
  // This prevents the protected content from flashing before the redirect can happen.
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Carregando aplicação...</p>
      </div>
    );
  }

  // Render children only when authorized. Hooks like useUser can be used within these
  // children or in the HeaderContent without affecting this layout's authorization logic.
  return (
      <div className="flex min-h-screen flex-col">
        <SidebarNav isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={closeMobileMenu} />
        <div className="flex flex-1 flex-col md:pl-64">
          <HeaderContent toggleMobileMenu={toggleMobileMenu} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
  );
}
