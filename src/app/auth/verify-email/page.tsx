// src/app/auth/verify-email/page.tsx
"use client";
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/common/logo';

export default function VerifyEmailPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-gray-800 p-8 shadow-lg text-center">
         <div className="flex justify-center">
            <Logo width={250} height={70} />
        </div>
        <div>
            <MailCheck className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Verifique seu E-mail
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Enviamos um link de verificação para sua caixa de entrada. Por favor, clique no link para ativar sua conta.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
                (Se não encontrar, verifique sua pasta de spam)
            </p>
        </div>
        <div className="pt-4">
            <Button asChild>
                <Link href="/login">Voltar para o Login</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
