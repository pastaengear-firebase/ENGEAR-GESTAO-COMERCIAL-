
// src/contexts/sales-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs, writeBatch, setDoc } from 'firebase/firestore';
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

  const isReadOnly = useMemo(() => selectedSeller === ALL_SELLERS_OPTION && (!user || !Object.keys(SELLER_EMAIL_MAP).includes(user.email?.toLowerCase() || '')), [selectedSeller, user]);

  const addSale = useCallback((saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'seller' | 'sellerUid'>): Sale => {
    if (!salesCollection || !user) throw new Error("Firestore ou usuário não está inicializado.");
    if (isReadOnly) throw new Error("Usuário não tem permissão para adicionar vendas.");

    const docRef = doc(salesCollection);
    const newSaleData = {
      ...saleData,
      seller: selectedSeller,
      sellerUid: user.uid,
    };
    
    // Fire-and-forget
    setDoc(docRef, { ...newSaleData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    
    return { 
        ...newSaleData, 
        seller: selectedSeller as Seller, 
        id: docRef.id, 
        createdAt: new Date().toISOString() 
    } as Sale;
  }, [salesCollection, selectedSeller, isReadOnly, user]);

  const addBulkSales = useCallback(async (newSalesData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'sellerUid'>[]) => {
    if (!firestore || !salesCollection || !user) throw new Error("Firestore ou usuário não está inicializado.");
    const batch = writeBatch(firestore);
    newSalesData.forEach(saleData => {
        const docRef = doc(salesCollection);
        batch.set(docRef, { ...saleData, sellerUid: user.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });
    await batch.commit();
  }, [firestore, salesCollection, user]);

  const updateSale = useCallback((id: string, saleUpdateData: Partial<Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!salesCollection) throw new Error("Firestore não está inicializado.");
    const originalSale = sales?.find(s => s.id === id);
    if (isReadOnly || (originalSale && originalSale.seller !== selectedSeller)) {
      throw new Error("Usuário não tem permissão para modificar esta venda.");
    }
    const saleRef = doc(salesCollection, id);
    updateDoc(saleRef, { ...saleUpdateData, updatedAt: serverTimestamp() });
  }, [sales, salesCollection, selectedSeller, isReadOnly]);

  const deleteSale = useCallback((id: string) => {
    if (!salesCollection) throw new Error("Firestore não está inicializado.");
    const originalSale = sales?.find(s => s.id === id);
     if (isReadOnly || (originalSale && originalSale.seller !== selectedSeller)) {
      throw new Error("Usuário não tem permissão para excluir esta venda.");
    }
    const saleRef = doc(salesCollection, id);
    deleteDoc(saleRef);
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
        if (selectedSeller === ALL_SELLERS_OPTION) return true;
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
  }, [sales, selectedSeller, filters]);

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
