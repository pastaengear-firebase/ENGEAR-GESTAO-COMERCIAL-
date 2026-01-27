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
    if (loading) return; // Aguarda o fim do carregamento

    if (!user) {
      router.replace('/login');
    } else if (!user.emailVerified) {
      router.replace('/auth/verify-email');
    }
  }, [user, loading, router]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Enquanto carrega ou se o usuário não for válido, mostra uma tela de carregamento de página inteira.
  // Isso impede o "flash" do conteúdo protegido.
  if (loading || !user || !user.emailVerified) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Apenas quando o usuário estiver totalmente autenticado e verificado, renderiza o layout principal.
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
