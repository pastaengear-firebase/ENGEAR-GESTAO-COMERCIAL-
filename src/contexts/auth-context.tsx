// src/contexts/auth-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { AppUser } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth || !firestore) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const { uid, email, displayName, photoURL } = firebaseUser;
        const appUser: AppUser = { uid, email, displayName, photoURL };
        
        const userRef = doc(firestore, 'users', uid);
        // When signing up with email, displayName and photoURL can be null.
        // We ensure not to overwrite existing values with null.
        const userData: any = { uid, email };
        if (displayName) userData.displayName = displayName;
        if (photoURL) userData.photoURL = photoURL;

        await setDoc(userRef, userData, { merge: true });

        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
        toast({
            title: "Erro de Autenticação",
            description: "O sistema de autenticação não foi inicializado corretamente.",
            variant: "destructive",
        });
        return;
    }
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      console.error("Error signing in with Google: ", error);
      
      let description = "Ocorreu um erro desconhecido durante o login.";
      if (error.code === 'auth/unauthorized-domain') {
          description = "O domínio da aplicação não está autorizado para login. Verifique as configurações de autenticação no seu projeto Firebase.";
      } else if (error.code === 'auth/popup-closed-by-user') {
          description = "A janela de login foi fechada antes da conclusão.";
      } else if (error.code === 'auth/configuration-not-found') {
          description = "O método de login com Google não está ativado no seu projeto Firebase. Por favor, ative-o no console do Firebase em Authentication > Sign-in method.";
      } else if (error.code === 'auth/api-key-not-valid') {
        description = "A chave de API do Firebase é inválida. Verifique o arquivo de configuração.";
      } else if (error.code) {
          description = `Erro: ${error.code}.`;
      }

      toast({
        title: "Falha no Login com Google",
        description: description,
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [auth, toast]);

  const signInWithEmail = useCallback(async (email, password) => {
    if (!auth) {
        toast({ title: "Erro de Autenticação", description: "Sistema não inicializado.", variant: "destructive" });
        return;
    }
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle success
    } catch (error: any) {
        console.error("Error signing in with email: ", error);
        let description = 'Ocorreu um erro desconhecido.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = 'E-mail ou senha inválidos.';
        } else if (error.code === 'auth/too-many-requests') {
            description = 'Muitas tentativas de login. Tente novamente mais tarde.';
        }
        toast({ title: 'Falha no Login', description, variant: 'destructive' });
    }
  }, [auth, toast]);

  const signUpWithEmail = useCallback(async (email, password) => {
    if (!auth) {
        toast({ title: "Erro de Autenticação", description: "Sistema não inicializado.", variant: "destructive" });
        return;
    }
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle success
    } catch (error: any) {
        console.error("Error signing up with email: ", error);
        let description = 'Ocorreu um erro desconhecido.';
        if (error.code === 'auth/email-already-in-use') {
            description = 'Este endereço de e-mail já está em uso.';
        } else if (error.code === 'auth/invalid-email') {
            description = 'O e-mail fornecido é inválido.';
        } else if (error.code === 'auth/weak-password') {
            description = 'A senha é muito fraca. Por favor, use pelo menos 6 caracteres.';
        }
        toast({ title: 'Falha no Cadastro', description, variant: 'destructive' });
    }
  }, [auth, toast]);

  const signOut = useCallback(async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }, [auth, router]);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, signInWithEmail, signUpWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
