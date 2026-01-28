// src/contexts/sales-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { ALL_SELLERS_OPTION, SELLER_EMAIL_MAP } from '@/lib/constants';
import type { Sale, Seller, SalesContextType, SalesFilters } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

export const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const firestore = useFirestore();
  const { user, loading: authLoading } = useAuth();
  
  const salesCollection = useMemo(() => firestore ? collection(firestore, 'sales') : null, [firestore]);
  
  const { data: sales, loading: salesLoading } = useCollection<Sale>(salesCollection);

  const [selectedSeller, setSelectedSeller] = useState<Seller | typeof ALL_SELLERS_OPTION>(ALL_SELLERS_OPTION);
  const [filters, setFiltersState] = useState<SalesFilters>({ selectedYear: 'all' });
  
  useEffect(() => {
    if (authLoading) return;
    if (user && user.email) {
      const seller = SELLER_EMAIL_MAP[user.email.toLowerCase() as keyof typeof SELLER_EMAIL_MAP];
      if (seller) {
        setSelectedSeller(seller);
      } else {
        setSelectedSeller(ALL_SELLERS_OPTION);
      }
    } else {
      setSelectedSeller(ALL_SELLERS_OPTION);
    }
  }, [user, authLoading]);

  const isReadOnly = useMemo(() => selectedSeller === ALL_SELLERS_OPTION, [selectedSeller]);

  const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale> => {
    if (!salesCollection) throw new Error("Firestore não está inicializado.");
    if (isReadOnly) throw new Error("Usuário não tem permissão para adicionar vendas.");

    const docRef = await addDoc(salesCollection, {
      ...saleData,
      seller: selectedSeller,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { ...saleData, seller: selectedSeller, id: docRef.id, createdAt: Date.now() };
  }, [salesCollection, selectedSeller, isReadOnly]);

  const addBulkSales = useCallback(async (newSalesData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    if (!firestore || !salesCollection) throw new Error("Firestore não está inicializado.");
    const batch = writeBatch(firestore);
    newSalesData.forEach(saleData => {
        const docRef = doc(salesCollection);
        batch.set(docRef, { ...saleData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });
    await batch.commit();
  }, [firestore, salesCollection]);

  const updateSale = useCallback(async (id: string, saleUpdateData: Partial<Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Sale | undefined> => {
    if (!salesCollection) throw new Error("Firestore não está inicializado.");
    const originalSale = sales?.find(s => s.id === id);
    if (isReadOnly || (originalSale && originalSale.seller !== selectedSeller)) {
      throw new Error("Usuário não tem permissão para modificar esta venda.");
    }
    const saleRef = doc(salesCollection, id);
    await updateDoc(saleRef, { ...saleUpdateData, updatedAt: serverTimestamp() });
    
    return originalSale ? { ...originalSale, ...saleUpdateData, id, updatedAt: Date.now() } : undefined;
  }, [sales, salesCollection, selectedSeller, isReadOnly]);

  const deleteSale = useCallback(async (id: string) => {
    if (!salesCollection) throw new Error("Firestore não está inicializado.");
    const originalSale = sales?.find(s => s.id === id);
     if (isReadOnly || (originalSale && originalSale.seller !== selectedSeller)) {
      throw new Error("Usuário não tem permissão para excluir esta venda.");
    }
    const saleRef = doc(salesCollection, id);
    await deleteDoc(saleRef);
  }, [salesCollection, sales, selectedSeller, isReadOnly]);

  const getSaleById = useCallback((id: string): Sale | undefined => {
    return sales?.find(sale => sale.id === id);
  }, [sales]);

  const setFilters = useCallback((newFilters: Partial<SalesFilters>) => {
    setFiltersState(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  const filteredSales = useMemo(() => {
    return (sales || [])
      .filter(sale => {
        // With auth, selectedSeller is now a derived state, not a filter.
        // If the user is a specific seller, they only see their sales.
        // If they are not a seller (isReadOnly), they see all sales.
        if (isReadOnly) return true;
        return sale.seller === selectedSeller;
      })
      .filter(sale => {
        if (!filters.searchTerm) return true;
        const term = filters.searchTerm.toLowerCase();
        return (
          sale.company.toLowerCase().includes(term) ||
          sale.project.toLowerCase().includes(term) ||
          sale.os.toLowerCase().includes(term) ||
          sale.clientService.toLowerCase().includes(term)
        );
      })
      .filter(sale => {
        if (!filters.selectedYear || filters.selectedYear === 'all') return true;
        const saleYear = new Date(sale.date).getFullYear();
        return saleYear === filters.selectedYear;
      });
  }, [sales, selectedSeller, filters, isReadOnly]);

  const loading = salesLoading || authLoading;

  return (
    <SalesContext.Provider
      value={{
        sales: sales || [],
        filteredSales,
        selectedSeller,
        isReadOnly,
        addSale,
        addBulkSales,
        updateSale,
        deleteSale,
        getSaleById,
        setFilters,
        filters,
        loading
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};
