// src/contexts/quotes-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useFirestore, useCollection, useUser } from '@/firebase'; // Importa useUser
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ALL_SELLERS_OPTION, SELLERS } from '@/lib/constants';
import type { Quote, QuotesContextType, Seller, FollowUpDaysOptionValue, QuoteDashboardFilters } from '@/lib/types';
import { SalesContext } from './sales-context'; 
import { format, parseISO, addDays } from 'date-fns';

export const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

export const QuotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: userLoading } = useUser(); // Usa o hook de autenticação
  const firestore = useFirestore();

  // A coleção só é definida se o firestore e o usuário estiverem prontos
  const quotesCollection = useMemo(() => firestore ? collection(firestore, 'quotes') : null, [firestore]);
  
  // O hook useCollection só é ativado se a coleção e o usuário existirem
  const { data: quotes, loading: loadingQuotesData } = useCollection<Quote>(user && quotesCollection ? quotesCollection : null);

  const [managementSearchTerm, setManagementSearchTermState] = useState<string>('');
  const [dashboardFilters, setDashboardFiltersState] = useState<QuoteDashboardFilters>({ selectedYear: 'all' });

  const salesContext = useContext(SalesContext);
  if (!salesContext) {
    throw new Error("QuotesProvider must be used within a SalesProvider");
  }
  const { selectedSeller } = salesContext;

  const calculateFollowUpDate = (proposalDateStr: string, offsetDays?: FollowUpDaysOptionValue): string | null => {
    if (offsetDays && offsetDays > 0) {
        try {
            const proposalD = parseISO(proposalDateStr); 
            return format(addDays(proposalD, offsetDays), 'yyyy-MM-dd');
        } catch(e) {
            console.error("Error calculating followUpDate", e);
            return null;
        }
    }
    return null;
  };

  const addQuote = useCallback(async (
    quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'seller' | 'followUpDate' | 'followUpDone'> & { followUpDaysOffset?: FollowUpDaysOptionValue, sendProposalNotification?: boolean }
  ): Promise<Quote> => {
    if (!quotesCollection) throw new Error("Firestore não inicializado para propostas");
    if (!user) throw new Error("Usuário não autenticado.");
    if (selectedSeller === ALL_SELLERS_OPTION || !SELLERS.includes(selectedSeller as Seller)) {
      throw new Error("Um vendedor específico (SERGIO ou RODRIGO) deve ser selecionado para adicionar uma proposta.");
    }
    
    const finalFollowUpDate = calculateFollowUpDate(quoteData.proposalDate, quoteData.followUpDaysOffset);
    const { followUpDaysOffset, ...restOfQuoteData } = quoteData;

    const newQuoteData = {
      ...restOfQuoteData,
      seller: selectedSeller as Seller,
      followUpDate: finalFollowUpDate,
      followUpDone: false, 
      sendProposalNotification: quoteData.sendProposalNotification || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(quotesCollection, newQuoteData);

    return { ...quoteData, seller: selectedSeller as Seller, id: docRef.id, followUpDate: finalFollowUpDate, createdAt: Date.now() };
  }, [selectedSeller, quotesCollection, user]);

  const updateQuote = useCallback(async (
    id: string, 
    quoteUpdateData: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'seller' | 'followUpDate'>> & { followUpDaysOffset?: FollowUpDaysOptionValue, sendProposalNotification?: boolean, followUpDone?: boolean }
  ): Promise<Quote | undefined> => {
    if (!quotesCollection) throw new Error("Firestore não inicializado para propostas");
     if (!user) throw new Error("Usuário não autenticado.");
    const quoteRef = doc(quotesCollection, id);
    const originalQuote = quotes?.find(q => q.id === id);
    if (!originalQuote) return undefined;
    
    const currentProposalDate = quoteUpdateData.proposalDate || originalQuote.proposalDate;
    let finalFollowUpDate = originalQuote.followUpDate; 
    if (quoteUpdateData.followUpDaysOffset !== undefined || quoteUpdateData.proposalDate) {
        finalFollowUpDate = calculateFollowUpDate(currentProposalDate, quoteUpdateData.followUpDaysOffset);
    }
    
    const { followUpDaysOffset, ...restOfUpdateData } = quoteUpdateData;
    
    const updatePayload = {
        ...restOfUpdateData,
        followUpDate: finalFollowUpDate,
        updatedAt: serverTimestamp()
    };

    await updateDoc(quoteRef, updatePayload);
    
    return { ...originalQuote, ...quoteUpdateData, id, followUpDate: finalFollowUpDate, updatedAt: Date.now() };
  }, [quotes, quotesCollection, user]);

  const deleteQuote = useCallback(async (id: string) => {
    if (!quotesCollection) throw new Error("Firestore não inicializado para propostas");
     if (!user) throw new Error("Usuário não autenticado.");
    await deleteDoc(doc(quotesCollection, id));
  }, [quotesCollection, user]);

  const getQuoteById = useCallback((id: string): Quote | undefined => {
    return quotes?.find(quote => quote.id === id);
  }, [quotes]);

  const toggleFollowUpDone = useCallback(async (quoteId: string) => {
    if (!quotesCollection) throw new Error("Firestore não inicializado para propostas");
     if (!user) throw new Error("Usuário não autenticado.");
    const quoteRef = doc(quotesCollection, quoteId);
    const quote = quotes?.find(q => q.id === quoteId);
    if (quote) {
        await updateDoc(quoteRef, {
            followUpDone: !quote.followUpDone,
            updatedAt: serverTimestamp()
        });
    }
  }, [quotes, quotesCollection, user]);

  const setManagementSearchTerm = useCallback((term: string) => {
    setManagementSearchTermState(term);
  }, []);

  const managementFilteredQuotes = useMemo(() => {
    return (quotes || [])
      .filter(quote => {
        if (selectedSeller === ALL_SELLERS_OPTION) return true;
        return quote.seller === selectedSeller;
      })
      .filter(quote => {
        if (!managementSearchTerm.trim()) return true;
        const lowerSearchTerm = managementSearchTerm.toLowerCase();
        return (
          quote.clientName.toLowerCase().includes(lowerSearchTerm) ||
          quote.description.toLowerCase().includes(lowerSearchTerm) ||
          quote.area.toLowerCase().includes(lowerSearchTerm) ||
          String(quote.proposedValue).includes(lowerSearchTerm)
        );
      });
  }, [quotes, selectedSeller, managementSearchTerm]);

  const setDashboardFilters = useCallback((newFilters: Partial<QuoteDashboardFilters>) => {
    setDashboardFiltersState(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  const dashboardFilteredQuotes = useMemo(() => {
    return (quotes || [])
      .filter(quote => {
        if (selectedSeller === ALL_SELLERS_OPTION) return true;
        return quote.seller === selectedSeller;
      })
      .filter(quote => {
        if (!dashboardFilters.selectedYear || dashboardFilters.selectedYear === 'all') return true;
        const quoteYear = new Date(quote.proposalDate).getFullYear();
        return quoteYear === dashboardFilters.selectedYear;
      });
  }, [quotes, selectedSeller, dashboardFilters]);
  
  const loadingQuotes = userLoading || loadingQuotesData;

  return (
    <QuotesContext.Provider
      value={{
        quotes: quotes || [],
        selectedSeller, 
        
        managementFilteredQuotes,
        setManagementSearchTerm,
        managementSearchTerm,

        dashboardFilteredQuotes,
        setDashboardFilters,
        dashboardFilters,
        
        addQuote,
        updateQuote,
        deleteQuote,
        getQuoteById,
        toggleFollowUpDone,
        loadingQuotes
      }}
    >
      {children}
    </QuotesContext.Provider>
  );
};
