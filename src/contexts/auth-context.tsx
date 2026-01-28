// src/contexts/auth-context.tsx
"use client";
import type React from 'react';
import { createContext, useCallback } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import type { User as FirebaseUser } from 'firebase/auth';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import type { AppUser } from '@/lib/types';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const formatUser = (user: FirebaseUser): AppUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: firebaseUser, loading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const user = firebaseUser ? formatUser(firebaseUser) : null;

  const updateUserProfile = useCallback(async (userToUpdate: FirebaseUser) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', userToUpdate.uid);
    const profile: AppUser = {
      uid: userToUpdate.uid,
      email: userToUpdate.email,
      displayName: userToUpdate.displayName,
      photoURL: userToUpdate.photoURL,
    };
    await setDoc(userRef, { ...profile, updatedAt: serverTimestamp() }, { merge: true });
  }, [firestore]);

  const signInWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await updateUserProfile(result.user);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };

  const signOut = async () => {
    const auth = getAuth();
    await firebaseSignOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
