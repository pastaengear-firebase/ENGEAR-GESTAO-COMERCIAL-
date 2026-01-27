// src/app/(app)/layout.tsx
"use client";
import type React from 'react';
import { useState, useEffect } from 'react';
import SidebarNav from '@/components/layout/sidebar-nav';
import HeaderContent from '@/components/layout/header-content';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { APP_ACCESS_GRANTED_KEY } from '@/lib/constants';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false); // New state

  useEffect(() => {
    // This check must run on the client after hydration
    const accessGranted = sessionStorage.getItem(APP_ACCESS_GRANTED_KEY) === 'true';
    
    // Wait until Firebase auth state is resolved
    if (loading) {
      return; 
    }

    if (!accessGranted || !user) {
      // If either check fails, redirect to login
      router.replace('/login');
    } else {
      // Only if both checks pass, authorize the user to see the content
      setIsAuthorized(true);
    }
  }, [user, loading, router]);


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // While checking authorization, show a loader. This prevents content flashing.
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Autenticando acesso seguro...</p>
      </div>
    );
  }

  // Render children only when authorized
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
