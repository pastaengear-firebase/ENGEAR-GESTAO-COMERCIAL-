// src/contexts/sales-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { SELLERS, ALL_SELLERS_OPTION, LOCAL_STORAGE_SELECTED_SELLER_KEY } from '@/lib/constants';
import type { Sale, Seller, SalesContextType, SalesFilters } from '@/lib/types';
import { useUser } from '@/firebase'; // Importa o hook useUser para verificar a autenticação

export const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: userLoading } = useUser(); // Usa o hook para obter o usuário e o estado de carregamento
  const firestore = useFirestore();
  
  // A coleção só é definida se o firestore estiver pronto
  const salesCollection = useMemo(() => firestore ? collection(firestore, 'sales') : null, [firestore]);
  
  // O hook useCollection só é ativado se a coleção estiver definida
  const { data: sales, loading: salesLoading } = useCollection<Sale>(user && salesCollection ? salesCollection : null);

  const [selectedSeller, setSelectedSellerState] = useState<Seller | typeof ALL_SELLERS_OPTION>(ALL_SELLERS_OPTION);
  const [filters, setFiltersState] = useState<SalesFilters>({ selectedYear: 'all' });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSeller = localStorage.getItem(LOCAL_STORAGE_SELECTED_SELLER_KEY);
      if (storedSeller && (SELLERS.includes(storedSeller as Seller) || storedSeller === ALL_SELLERS_OPTION)) {
        setSelectedSellerState(storedSeller as Seller | typeof ALL_SELLERS_OPTION);
      }
    }
  }, []);

  const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale> => {
    if (!salesCollection) throw new Error("Firestore não está inicializado.");
    if (!user) throw new Error("Usuário não autenticado."); // Garante que há um usuário

    const docRef = await addDoc(salesCollection, {
      ...saleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // O retorno pode precisar ser ajustado se o timestamp do servidor for crucial
    return { ...saleData, id: docRef.id, createdAt: Date.now() };
  }, [salesCollection, user]);

  const addBulkSales = useCallback(async (newSalesData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    if (!firestore || !salesCollection) throw new Error("Firestore não está inicializado.");
     if (!user) throw new Error("Usuário não autenticado.");
    const batch = writeBatch(firestore);
    newSalesData.forEach(saleData => {
        const docRef = doc(salesCollection);
        batch.set(docRef, { ...saleData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });
    await batch.commit();
  }, [firestore, salesCollection, user]);

  const updateSale = useCallback(async (id: string, saleUpdateData: Partial<Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Sale | undefined> => {
    if (!salesCollection) throw new Error("Firestore não está inicializado.");
    if (!user) throw new Error("Usuário não autenticado.");

    const saleRef = doc(salesCollection, id);
    await updateDoc(saleRef, { ...saleUpdateData, updatedAt: serverTimestamp() });
    const originalSale = sales?.find(s => s.id === id);
    return originalSale ? { ...originalSale, ...saleUpdateData, id, updatedAt: Date.now() } : undefined;
  }, [sales, salesCollection, user]);

  const deleteSale = useCallback(async (id: string) => {
    if (!salesCollection) throw new Error("Firestore não está inicializado.");
    if (!user) throw new Error("Usuário não autenticado.");
    
    const saleRef = doc(salesCollection, id);
    await deleteDoc(saleRef);
  }, [salesCollection, user]);

  const getSaleById = useCallback((id: string): Sale | undefined => {
    return sales?.find(sale => sale.id === id);
  }, [sales]);

  const setSelectedSeller = useCallback((seller: Seller | typeof ALL_SELLERS_OPTION) => {
    setSelectedSellerState(seller);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_SELECTED_SELLER_KEY, seller);
    }
  }, []);

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

  // Combina o carregamento do usuário e dos dados de vendas
  const loading = userLoading || salesLoading;

  return (
    <SalesContext.Provider
      value={{
        sales: sales || [],
        filteredSales,
        selectedSeller,
        setSelectedSeller,
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
