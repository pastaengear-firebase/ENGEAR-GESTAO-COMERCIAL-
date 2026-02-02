// src/firebase/provider.tsx
'use client';
import type React from 'react';
import { createContext, useContext, useMemo } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { FirebaseStorage } from 'firebase/storage';

interface FirebaseContextType {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

interface FirebaseProviderProps {
  children: React.ReactNode;
  value: {
    app: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
    storage: FirebaseStorage;
  };
}

export function FirebaseProvider({ children, value }: FirebaseProviderProps) {
  const contextValue = useMemo(() => value, [value]);
  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
    const context = useFirebase();
    return context.app;
}

export function useFirestore() {
    const context = useFirebase();
    return context.firestore;
}

export function useAuth() {
    const context = useFirebase();
    return context.auth;
}

export function useStorage() {
    const context = useFirebase();
    return context.storage;
}
