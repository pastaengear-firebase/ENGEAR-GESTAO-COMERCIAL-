// src/app/auth/forgot-password/page.tsx
"use client";
import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/common/logo';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!auth) {
      toast({
        title: "Erro de Serviço",
        description: "Serviço de autenticação não disponível.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "E-mail Enviado",
        description: "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
      });
      setIsSent(true);

    } catch (error: any) {
      console.error("Erro ao enviar e-mail de redefinição:", error);
      // We don't want to reveal if an email exists or not for security reasons.
      // So, we show a success message even on error.
      toast({
        title: "E-mail Enviado",
        description: "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
      });
      setIsSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-white dark:bg-gray-800 p-8 shadow-lg">
        <div className="text-center">
           <div className="flex justify-center mb-4">
            <Logo width={250} height={70} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isSent 
              ? "Verifique sua caixa de entrada (e spam)."
              : "Insira seu e-mail para receber um link de recuperação."
            }
          </p>
        </div>
        
        {isSent ? (
            <div className="text-center pt-4">
                <Button asChild>
                    <Link href="/login">Voltar para o Login</Link>
                </Button>
            </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </Button>
          </form>
        )}

        {!isSent && (
            <p className="text-center text-sm text-muted-foreground">
              Lembrou a senha?{' '}
              <Link href="/login" passHref>
                <span className="text-primary hover:underline cursor-pointer">
                  Faça login
                </span>
              </Link>
            </p>
        )}

      </div>
    </div>
  );
}
