// src/firebase/auth/use-user.tsx
'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { useAuth } from '../provider';
import { useToast } from '@/hooks/use-toast';

export function useUser() {
  const auth = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    };
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            setLoading(false);
        } else {
            // Se não houver usuário, tente o login anônimo
            signInAnonymously(auth)
                .then((userCredential) => {
                    setUser(userCredential.user);
                })
                .catch((error) => {
                    console.error("Anonymous sign-in failed:", error);
                    toast({
                        title: "Falha na Autenticação",
                        description: "Não foi possível conectar ao serviço de autenticação. Algumas funcionalidades podem não funcionar.",
                        variant: "destructive",
                    });
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    });

    return () => unsubscribe();
  }, [auth, toast]);

  return { user, loading };
}
