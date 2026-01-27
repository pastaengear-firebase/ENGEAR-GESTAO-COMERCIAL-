// src/contexts/settings-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useFirestore, useDoc, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { AppSettings, SettingsContextType } from '@/lib/types';

const defaultSettings: AppSettings = {
  enableEmailNotifications: false,
  notificationEmails: [],
  enableProposalEmailNotifications: false,
};

const SETTINGS_DOC_ID = 'global'; // Use a single document for all app settings

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();

  const settingsDocRef = useMemo(() => {
      // Only create ref if firestore and user are available
      if (firestore && user) {
          return doc(firestore, 'settings', SETTINGS_DOC_ID);
      }
      return null;
  }, [firestore, user]);

  const { data: firestoreSettings, loading: loadingFirestoreSettings } = useDoc<AppSettings>(settingsDocRef);
  
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  
  useEffect(() => {
    if (firestoreSettings) {
        // Merge firestore settings with defaults to ensure all keys are present
        setSettings({ ...defaultSettings, ...firestoreSettings });
    }
  }, [firestoreSettings]);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
      if (!settingsDocRef) {
          console.error("Cannot update settings: Firestore is not available or user is not logged in.");
          return;
      }
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings); // Optimistic update
      
      try {
        await setDoc(settingsDocRef, {
            ...newSettings, // only send the changed fields
            updatedAt: serverTimestamp() 
        }, { merge: true });
      } catch (error) {
          console.error("Error updating settings in Firestore:", error);
          // Revert optimistic update on error if needed
          setSettings(settings); 
      }
  }, [settingsDocRef, settings]);

  const loadingSettings = userLoading || loadingFirestoreSettings;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loadingSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
