// src/firebase/client-provider.tsx
'use client';
import type React from 'react';
import { useMemo, useEffect } from 'react';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebase = useMemo(() => initializeFirebase(), []);

  // Initialize App Check on the client side
  useEffect(() => {
    if (typeof window === 'undefined' || !firebase.app) return;

    // Force the debug token for preview/development environments.
    // This is crucial for App Check to work without a real reCAPTCHA
    // verification in a non-production context.
    (window as any).self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    try {
      // If a reCAPTCHA key is available (for production), use the ReCaptchaV3Provider.
      // The debug token will still be used if found in local storage, which is useful for testing.
      if (siteKey && siteKey !== 'COLE_A_SUA_CHAVE_DE_SITE_AQUI') {
        initializeAppCheck(firebase.app, {
          provider: new ReCaptchaV3Provider(siteKey),
          isTokenAutoRefreshEnabled: true,
        });
        console.log("Firebase App Check: Inicializado com o provedor reCAPTCHA.");
      } else {
        // If no reCAPTCHA key, initialize without a provider.
        // Because the debug token is set, the SDK will automatically use the debug provider.
        // This is the intended behavior for the development/preview environment.
        initializeAppCheck(firebase.app, {
          isTokenAutoRefreshEnabled: true,
        });
        console.log("Firebase App Check: Chave reCAPTCHA não encontrada. Inicializado com o provedor de depuração.");
      }
    } catch (error) {
      console.error("Firebase App Check: Erro ao inicializar.", error);
    }
  }, [firebase.app]);

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
