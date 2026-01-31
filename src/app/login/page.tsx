// src/app/login/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Logo from '@/components/common/logo';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginFormData } from '@/lib/schemas';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="24px"
    height="24px"
    {...props}
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.057,4.71c2.29-1.422,4.86-2.18,7.637-2.18c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-4.819c-1.805,1.227-4.004,1.962-6.219,1.962c-3.665,0-6.91-1.84-8.807-4.628l-6.057,4.71C9.5,39.596,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,4.819C42.02,35.625,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);


export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    // If user is already authenticated, redirect them away from login page
    if (!loading && user) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.replace(redirect);
    }
  }, [user, loading, router, searchParams]);

  const handleAuthAction = async (action: 'login' | 'signup', data: LoginFormData) => {
    setIsSubmitting(true);
    if (action === 'login') {
      await signInWithEmail(data.email, data.password);
    } else {
      await signUpWithEmail(data.email, data.password);
    }
    // If auth is successful, the useEffect will redirect.
    // If it fails, the user remains on the page, so we reset the submitting state.
    setIsSubmitting(false);
  };


  if (loading || user) {
      return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <Card className="w-full max-w-sm shadow-2xl">
            <CardHeader className="items-center text-center space-y-4">
                <Logo width={200} height={60} />
            <CardTitle className="text-2xl">CONTROLE DE VENDAS</CardTitle>
            <CardDescription>Acesse sua conta para continuar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Form {...form}>
                    <form className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-mail</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="seu@email.com" {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                 <div className="flex flex-col space-y-2">
                    <Button onClick={form.handleSubmit((data) => handleAuthAction('login', data))} disabled={isSubmitting} className="w-full">
                        {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                        Entrar
                    </Button>
                     <Button onClick={form.handleSubmit((data) => handleAuthAction('signup', data))} disabled={isSubmitting} className="w-full" variant="secondary">
                        {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                        Registrar Nova Conta
                    </Button>
                </div>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">OU</span>
                    </div>
                </div>
                <Button onClick={signInWithGoogle} className="w-full" variant="outline" disabled={isSubmitting}>
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    Entrar com Google
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
