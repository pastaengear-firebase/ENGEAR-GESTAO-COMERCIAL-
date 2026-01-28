// src/contexts/quotes-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useCallback, useContext, useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ALL_SELLERS_OPTION, SELLERS } from '@/lib/constants';
import type { Quote, QuotesContextType, Seller, FollowUpDaysOptionValue, QuoteDashboardFilters } from '@/lib/types';
import { useSales } from '@/hooks/use-sales';
import { format, parseISO, addDays } from 'date-fns';

export const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

export const QuotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const firestore = useFirestore();

  const quotesCollection = useMemo(() => firestore ? collection(firestore, 'quotes') : null, [firestore]);
  
  const { data: quotes, loading: loadingQuotesData } = useCollection<Quote>(quotesCollection);

  const [managementSearchTerm, setManagementSearchTermState] = useState<string>('');
  const [dashboardFilters, setDashboardFiltersState] = useState<QuoteDashboardFilters>({ selectedYear: 'all' });

  const { selectedSeller, isReadOnly } = useSales();

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
    if (isReadOnly) {
      throw new Error("Usuário sem permissão para adicionar proposta.");
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

    return { ...quoteData, seller: selectedSeller as Seller, id: docRef.id, followUpDate: finalFollowUpDate, createdAt: new Date() };
  }, [selectedSeller, quotesCollection, isReadOnly]);

  const updateQuote = useCallback(async (
    id: string, 
    quoteUpdateData: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'seller' | 'followUpDate'>> & { followUpDaysOffset?: FollowUpDaysOptionValue, sendProposalNotification?: boolean, followUpDone?: boolean }
  ): Promise<Quote | undefined> => {
    if (!quotesCollection) throw new Error("Firestore não inicializado para propostas");
    const originalQuote = quotes?.find(q => q.id === id);
    if (!originalQuote) return undefined;
    if (isReadOnly || selectedSeller !== originalQuote.seller) throw new Error("Usuário não tem permissão para modificar esta proposta.");

    const quoteRef = doc(quotesCollection, id);
    
    const currentProposalDate = quoteUpdateData.proposalDate || originalQuote.proposalDate;
    let finalFollowUpDate = originalQuote.followUpDate; 
    if (quoteUpdateData.followUpDaysOffset !== undefined || quoteUpdateData.proposalDate) {
        finalFollowUpDate = calculateFollowUpDate(currentProposalDate, quoteUpdateData.followUpDaysOffset);
    }
    
    const { followUpDaysOffset, ...restOfUpdateData } = quoteUpdateData;
    
    const updatePayload: Partial<Quote> & {updatedAt: any} = {
        ...(restOfUpdateData as Partial<Quote>),
        followUpDate: finalFollowUpDate,
        updatedAt: serverTimestamp()
    };

    await updateDoc(quoteRef, updatePayload);
    
    return { ...originalQuote, ...quoteUpdateData, id, followUpDate: finalFollowUpDate, updatedAt: new Date() };
  }, [quotes, quotesCollection, isReadOnly, selectedSeller]);

  const deleteQuote = useCallback(async (id: string) => {
    if (!quotesCollection) throw new Error("Firestore não inicializado para propostas");
    const originalQuote = quotes?.find(q => q.id === id);
    if (isReadOnly || (originalQuote && selectedSeller !== originalQuote.seller)) throw new Error("Usuário não tem permissão para excluir esta proposta.");
    await deleteDoc(doc(quotesCollection, id));
  }, [quotes, quotesCollection, isReadOnly, selectedSeller]);

  const getQuoteById = useCallback((id: string): Quote | undefined => {
    return quotes?.find(quote => quote.id === id);
  }, [quotes]);

  const toggleFollowUpDone = useCallback(async (quoteId: string) => {
    if (!quotesCollection) throw new Error("Firestore não inicializado para propostas");
    const quote = quotes?.find(q => q.id === quoteId);
    if (isReadOnly || (quote && selectedSeller !== quote.seller)) throw new Error("Usuário não tem permissão para modificar esta proposta.");
    
    if (quote) {
        const quoteRef = doc(quotesCollection, quoteId);
        await updateDoc(quoteRef, {
            followUpDone: !quote.followUpDone,
            updatedAt: serverTimestamp()
        });
    }
  }, [quotes, quotesCollection, isReadOnly, selectedSeller]);

  const setManagementSearchTerm = useCallback((term: string) => {
    setManagementSearchTermState(term);
  }, []);

  const managementFilteredQuotes = useMemo(() => {
    return (quotes || [])
      .filter(quote => {
        if (isReadOnly) return true;
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
  }, [quotes, selectedSeller, managementSearchTerm, isReadOnly]);

  const setDashboardFilters = useCallback((newFilters: Partial<QuoteDashboardFilters>) => {
    setDashboardFiltersState(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  const dashboardFilteredQuotes = useMemo(() => {
    return (quotes || [])
      .filter(quote => {
        if (isReadOnly) return true;
        return quote.seller === selectedSeller;
      })
      .filter(quote => {
        if (!dashboardFilters.selectedYear || dashboardFilters.selectedYear === 'all') return true;
        const quoteYear = new Date(quote.proposalDate).getFullYear();
        return quoteYear === dashboardFilters.selectedYear;
      });
  }, [quotes, selectedSeller, dashboardFilters, isReadOnly]);
  
  const loadingQuotes = loadingQuotesData;

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
