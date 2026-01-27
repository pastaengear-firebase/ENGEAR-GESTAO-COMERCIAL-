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
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    const accessGranted = sessionStorage.getItem(APP_ACCESS_GRANTED_KEY) === 'true';
    if (accessGranted) {
      // If access is granted, allow rendering the children.
      setIsAuthorized(true);
    } else {
      // If not, redirect to the login page.
      router.replace('/');
    }
  }, [router]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // While not authorized, render a full-screen loader.
  // This prevents any "flash" of the protected content (children)
  // because the component returns here before reaching the children.
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Verificando autorização...</p>
      </div>
    );
  }

  // Only once authorization is confirmed, render the main app layout.
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
