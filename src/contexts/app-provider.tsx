// src/contexts/app-provider.tsx
"use client";
import type React from 'react';
import { AuthProvider } from './auth-context';
import { SalesProvider } from './sales-context';
import { SettingsProvider } from './settings-context';
import { QuotesProvider } from './quotes-context';
import { TooltipProvider } from "@/components/ui/tooltip";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <SalesProvider>
        <SettingsProvider>
          <QuotesProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </QuotesProvider>
        </SettingsProvider>
      </SalesProvider>
    </AuthProvider>
  );
};