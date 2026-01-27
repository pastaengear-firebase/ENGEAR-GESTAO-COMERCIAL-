// src/firebase/client-provider.tsx
'use client';
import type React from 'react';
import { useMemo } from 'react';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebase = useMemo(() => initializeFirebase(), []);

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
