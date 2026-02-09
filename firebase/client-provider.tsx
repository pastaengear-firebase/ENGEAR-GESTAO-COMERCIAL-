// src/firebase/client-provider.tsx
'use client';
import type React from 'react';
import { useMemo, useEffect } from 'react';
import { initializeFirebase } from './init'; 
import { FirebaseProvider } from './provider';
// App Check: manter só em DEV para não bloquear produção (403)
if (process.env.NODE_ENV !== 'production') {
  initializeAppCheck(firebase.app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Inicializa o Firebase de forma isolada
  const firebase = useMemo(() => initializeFirebase(), []);

  useEffect(() => {
    if (typeof window === 'undefined' || !firebase.app) return;

    (window as any).self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    try {
      if (siteKey && siteKey !== 'COLE_A_SUA_CHAVE_DE_SITE_AQUI') {
        initializeAppCheck(firebase.app, {
          provider: new ReCaptchaV3Provider(siteKey),
          isTokenAutoRefreshEnabled: true,
        });
      } else {
        initializeAppCheck(firebase.app, {
          isTokenAutoRefreshEnabled: true,
        });
      }
    } catch (error) {
      console.error("Firebase App Check Error:", error);
    }
  }, [firebase.app]);

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
