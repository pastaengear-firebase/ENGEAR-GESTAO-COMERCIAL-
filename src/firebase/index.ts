// src/firebase/index.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

// Export providers and hooks for easy import
export { FirebaseProvider, FirebaseClientProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

// --- Initialize Firebase ---
let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function initializeFirebase() {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApps()[0];
  }
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);

  return { app: firebaseApp, auth, firestore };
}

export { initializeFirebase };
