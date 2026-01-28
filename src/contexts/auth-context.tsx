// src/contexts/auth-context.tsx
"use client";
import type React from 'react';
import { createContext, useCallback, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import type { User as FirebaseUser } from 'firebase/auth';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import type { AppUser } from '@/lib/types';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useAuth as useFirebaseAuth } from '@/firebase';

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
  const auth = useFirebaseAuth();
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

  // Check for redirect result on component mount
  useEffect(() => {
    if (auth) {
      getRedirectResult(auth)
        .then((result) => {
          if (result) {
            // This is the first login after redirect. Update the profile.
            updateUserProfile(result.user);
          }
        })
        .catch((error) => {
          console.error("Error processing redirect result:", error);
        });
    }
  }, [auth, updateUserProfile]);


  const signInWithGoogle = async () => {
    if (!auth) {
      console.error("Auth service not available.");
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider); // Use redirect instead of popup
  };

  const signOut = async () => {
    if (!auth) {
      console.error("Auth service not available.");
      return;
    }
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
