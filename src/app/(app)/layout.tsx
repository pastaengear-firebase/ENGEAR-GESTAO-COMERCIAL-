// src/app/(app)/layout.tsx
"use client";
import type React from 'react';
import { useState, useEffect } from 'react';
import SidebarNav from '@/components/layout/sidebar-nav';
import HeaderContent from '@/components/layout/header-content';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      // If loading is finished and there's no user, redirect to login
      router.replace('/login');
    } else if (!loading && user && !user.emailVerified) {
      // If user exists but email is not verified, redirect to verification page
      router.replace('/auth/verify-email');
    }
  }, [user, loading, router]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // While loading or if no user, show a loading screen or nothing
  // This prevents the "flash" of protected content
  if (loading || !user || !user.emailVerified) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Only once user is confirmed and verified, render the main app layout.
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
