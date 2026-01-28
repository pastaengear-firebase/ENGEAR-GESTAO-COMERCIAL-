// src/app/login/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/common/logo';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const { login, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect them away from login page
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (!success) {
      toast({
        title: "Senha Incorreta",
        description: "A senha inserida não é válida. Tente novamente.",
        variant: "destructive",
      });
      setPassword('');
    }
  };

  if (loading || (!loading && isAuthenticated)) {
      return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <form onSubmit={handleLogin}>
            <Card className="w-full max-w-sm shadow-2xl">
                <CardHeader className="items-center text-center space-y-4">
                    <Logo width={200} height={60} />
                <CardTitle className="text-2xl">CONTROLE DE VENDAS</CardTitle>
                <CardDescription>Insira a senha de acesso para continuar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Senha de Acesso</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            className="pl-10"
                            autoFocus
                        />
                    </div>
                </div>
                </CardContent>
                <CardFooter>
                <Button className="w-full" type="submit">
                    Entrar
                </Button>
                </CardFooter>
            </Card>
        </form>
    </div>
  );
}
