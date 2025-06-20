
// src/contexts/app-provider.tsx
"use client";
import type React from 'react';
import { AuthProvider } from './auth-context';
import { SalesProvider } from './sales-context';
import { SettingsProvider } from './settings-context';
import { QuotesProvider } from './quotes-context';
// import { PlannerProvider } from './planner-context'; // PlannerProvider removed
import { TooltipProvider } from "@/components/ui/tooltip";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <SalesProvider>
        <SettingsProvider>
          <QuotesProvider>
            {/* <PlannerProvider> */} {/* PlannerProvider removed */}
              <TooltipProvider>
                {children}
              </TooltipProvider>
            {/* </PlannerProvider> */}
          </QuotesProvider>
        </SettingsProvider>
      </SalesProvider>
    </AuthProvider>
  );
};
