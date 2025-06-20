
// src/contexts/planner-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { LOCAL_STORAGE_PLANNER_KEY, ALL_SELLERS_OPTION, SELLERS } from '@/lib/constants';
import type { PlannerItem, PlannerContextType, Seller } from '@/lib/types';
import { SalesContext } from './sales-context'; 
import { v4 as uuidv4 } from 'uuid';

export const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [loadingPlanner, setLoadingPlanner] = useState(true);
  const [plannerSearchTerm, setPlannerSearchTermState] = useState<string>('');

  const salesContext = useContext(SalesContext);
  if (!salesContext) {
    throw new Error("PlannerProvider must be used within a SalesProvider");
  }
  const { selectedSeller } = salesContext;

  useEffect(() => {
    setLoadingPlanner(true);
    try {
      const storedPlannerItems = localStorage.getItem(LOCAL_STORAGE_PLANNER_KEY);
      if (storedPlannerItems) {
        const parsedItems = JSON.parse(storedPlannerItems);
        if (Array.isArray(parsedItems)) {
          setPlannerItems(parsedItems.sort((a: PlannerItem, b: PlannerItem) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
        } else {
          setPlannerItems([]);
        }
      } else {
        setPlannerItems([]);
      }
    } catch (error) {
      console.error("PlannerContext: Error loading planner items from localStorage", error);
      setPlannerItems([]);
    } finally {
      setLoadingPlanner(false);
    }
  }, []);

  useEffect(() => {
    if (!loadingPlanner) {
      localStorage.setItem(LOCAL_STORAGE_PLANNER_KEY, JSON.stringify(plannerItems));
    }
  }, [plannerItems, loadingPlanner]);

  const addPlannerItem = useCallback((
    itemData: Omit<PlannerItem, 'id' | 'createdAt' | 'updatedAt' | 'responsibleSeller'>
  ): PlannerItem => {
    if (selectedSeller === ALL_SELLERS_OPTION || !SELLERS.includes(selectedSeller as Seller)) {
      throw new Error("Um vendedor específico (SERGIO ou RODRIGO) deve ser selecionado para adicionar um item ao planner.");
    }
    
    const newItem: PlannerItem = {
      ...itemData,
      id: uuidv4(),
      responsibleSeller: selectedSeller as Seller,
      createdAt: Date.now(),
    };
    
    setPlannerItems(prevItems => [...prevItems, newItem].sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
    return newItem;
  }, [selectedSeller]);

  const updatePlannerItem = useCallback((
    id: string, 
    itemUpdateData: Partial<Omit<PlannerItem, 'id' | 'createdAt' | 'updatedAt' | 'responsibleSeller'>>
  ): PlannerItem | undefined => {
    let updatedItem: PlannerItem | undefined;
    setPlannerItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          // Cannot change responsibleSeller directly through this update if it's not part of itemUpdateData
          // responsibleSeller is fixed at creation or handled by specific logic if re-assignment is allowed.
          updatedItem = {
            ...item,
            ...itemUpdateData,
            updatedAt: Date.now()
          };
          return updatedItem;
        }
        return item;
      }).sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    );
    return updatedItem;
  }, []);

  const deletePlannerItem = useCallback((id: string) => {
    setPlannerItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const getPlannerItemById = useCallback((id: string): PlannerItem | undefined => {
    return plannerItems.find(item => item.id === id);
  }, [plannerItems]);

  const setPlannerSearchTerm = useCallback((term: string) => {
    setPlannerSearchTermState(term);
  }, []);

  const filteredPlannerItems = useMemo(() => {
    return plannerItems
      .filter(item => {
        if (selectedSeller === ALL_SELLERS_OPTION) return true;
        return item.responsibleSeller === selectedSeller;
      })
      .filter(item => {
        if (!plannerSearchTerm.trim()) return true;
        const lowerSearchTerm = plannerSearchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(lowerSearchTerm) ||
          (item.clientName && item.clientName.toLowerCase().includes(lowerSearchTerm))
        );
      });
  }, [plannerItems, selectedSeller, plannerSearchTerm]);

  return (
    <PlannerContext.Provider
      value={{
        plannerItems,
        filteredPlannerItems,
        selectedSeller,
        addPlannerItem,
        updatePlannerItem,
        deletePlannerItem,
        getPlannerItemById,
        setPlannerSearchTerm,
        plannerSearchTerm,
        loadingPlanner,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};
