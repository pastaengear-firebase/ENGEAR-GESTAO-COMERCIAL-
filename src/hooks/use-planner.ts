// This file is intentionally left empty as the Planner module has been removed.
// It can be deleted from the project.
"use client";
import { useContext } from 'react';
import { PlannerContext } from '@/contexts/planner-context';
import type { PlannerContextType } from '@/lib/types';

// This hook will now throw an error if used, as the context is not fully provided.
export const usePlanner = (): PlannerContextType => {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    // Or return a dummy implementation if preferred to avoid runtime errors elsewhere temporarily
    throw new Error('usePlanner was called, but the Planner module has been removed.');
  }
  return context;
};
