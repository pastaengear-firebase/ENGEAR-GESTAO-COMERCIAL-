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
    if (typeof window === 'undefined') return; // Ensure this runs only on the client

    if (firebase.app) {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

      // Make sure the key is not the placeholder
      if (!siteKey || siteKey === 'COLE_A_SUA_CHAVE_DE_SITE_AQUI') {
        console.warn("Firebase App Check: Chave de site do reCAPTCHA não configurada. Adicione NEXT_PUBLIC_RECAPTCHA_SITE_KEY ao seu arquivo .env.local e publique o app para habilitar a proteção.");
        return;
      }
      
      try {
        // The `window.self.FIREBASE_APPCHECK_DEBUG_TOKEN` is optional and useful for local testing.
        // It's not harmful to leave in production.
        (window as any).self.FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NODE_ENV === 'development';
        
        initializeAppCheck(firebase.app, {
          provider: new ReCaptchaV3Provider(siteKey),
          isTokenAutoRefreshEnabled: true,
        });
        console.log("Firebase App Check: Inicializado com sucesso.");
      } catch (error) {
        console.error("Firebase App Check: Erro ao inicializar.", error);
      }
    }
  }, [firebase.app]);

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
