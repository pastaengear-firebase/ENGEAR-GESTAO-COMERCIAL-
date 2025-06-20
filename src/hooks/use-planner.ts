// src/hooks/use-planner.ts
"use client";
import { useContext } from 'react';
import { PlannerContext } from '@/contexts/planner-context';
import type { PlannerContextType } from '@/lib/types';

export const usePlanner = (): PlannerContextType => {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};
