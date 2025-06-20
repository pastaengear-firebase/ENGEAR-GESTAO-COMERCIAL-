// This file is intentionally left empty as the Planner module has been removed.
// It can be deleted from the project.
import type React from 'react';
import { createContext } from 'react';
import type { PlannerContextType } from '@/lib/types';

export const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>; // Provider does nothing now
};
