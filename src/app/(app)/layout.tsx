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
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Esta verificação é a única fonte de verdade para autorização.
    const accessGranted = sessionStorage.getItem(APP_ACCESS_GRANTED_KEY) === 'true';

    if (!accessGranted) {
      // Se a senha nunca foi inserida, redireciona para a página de login (a raiz).
      router.replace('/');
    } else {
      // Se a senha foi inserida, autoriza a visualização.
      setIsAuthorized(true);
    }
    // Marca a verificação como concluída.
    setIsVerifying(false);
  }, [router]);


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Enquanto verifica a autorização, exibe um loader em tela cheia.
  // Isso impede que o conteúdo protegido apareça brevemente antes do redirecionamento.
  if (isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Verificando autorização...</p>
      </div>
    );
  }

  // Se a verificação terminou e o usuário está autorizado, renderiza a aplicação.
  if (isAuthorized) {
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

  // Se a verificação terminou e o usuário não está autorizado,
  // exibe o loader enquanto o redirecionamento (iniciado no useEffect) acontece.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
