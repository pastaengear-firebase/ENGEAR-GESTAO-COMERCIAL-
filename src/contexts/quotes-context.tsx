
// src/contexts/quotes-context.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { LOCAL_STORAGE_QUOTES_KEY, ALL_SELLERS_OPTION, SELLERS } from '@/lib/constants';
import type { Quote, QuotesContextType, Seller } from '@/lib/types';
import { SalesContext } from './sales-context'; // Para acessar selectedSeller
import { v4 as uuidv4 } from 'uuid';

export const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

export const QuotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const salesContext = useContext(SalesContext);

  if (!salesContext) {
    throw new Error("QuotesProvider must be used within a SalesProvider");
  }
  const { selectedSeller } = salesContext;


  useEffect(() => {
    setLoadingQuotes(true);
    try {
      const storedQuotes = localStorage.getItem(LOCAL_STORAGE_QUOTES_KEY);
      if (storedQuotes) {
        const parsedQuotes = JSON.parse(storedQuotes);
         if (Array.isArray(parsedQuotes)) {
            setQuotes(parsedQuotes.sort((a,b) => new Date(b.proposalDate).getTime() - new Date(a.proposalDate).getTime()));
        } else {
            setQuotes([]); // Define como array vazio se o parse não for um array
        }
      } else {
         setQuotes([]); // Define como array vazio se não houver nada no localStorage
      }
    } catch (error) {
      console.error("QuotesContext: Error loading quotes from localStorage", error);
      setQuotes([]); // Fallback para array vazio em caso de erro
    } finally {
      setLoadingQuotes(false);
    }
  }, []);

  useEffect(() => {
    if (!loadingQuotes) {
      localStorage.setItem(LOCAL_STORAGE_QUOTES_KEY, JSON.stringify(quotes));
    }
  }, [quotes, loadingQuotes]);

  const addQuote = useCallback((quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'seller'>): Quote => {
    if (selectedSeller === ALL_SELLERS_OPTION || !SELLERS.includes(selectedSeller as Seller)) {
      throw new Error("Um vendedor específico (SERGIO ou RODRIGO) deve ser selecionado para adicionar uma proposta.");
    }
    const newQuote: Quote = {
      ...quoteData,
      id: uuidv4(),
      seller: selectedSeller as Seller,
      createdAt: Date.now(),
    };
    setQuotes(prevQuotes => [...prevQuotes, newQuote].sort((a,b) => new Date(b.proposalDate).getTime() - new Date(a.proposalDate).getTime()));
    return newQuote;
  }, [selectedSeller]);

  const updateQuote = useCallback((id: string, quoteUpdateData: Partial<Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'seller'>>): Quote | undefined => {
    let updatedQuote: Quote | undefined;
    setQuotes(prevQuotes =>
      prevQuotes.map(quote => {
        if (quote.id === id) {
          // Seller não pode ser alterado na atualização, mantém o original
          updatedQuote = {
            ...quote,
            ...quoteUpdateData,
            updatedAt: Date.now()
          };
          return updatedQuote;
        }
        return quote;
      }).sort((a,b) => new Date(b.proposalDate).getTime() - new Date(a.proposalDate).getTime())
    );
    return updatedQuote;
  }, []);

  const deleteQuote = useCallback((id: string) => {
    setQuotes(prevQuotes => prevQuotes.filter(quote => quote.id !== id));
  }, []);

  const getQuoteById = useCallback((id: string): Quote | undefined => {
    return quotes.find(quote => quote.id === id);
  }, [quotes]);

  return (
    <QuotesContext.Provider
      value={{
        quotes,
        selectedSeller, // Fornecido pelo SalesContext, usado aqui para lógica de add/disabled
        addQuote,
        updateQuote,
        deleteQuote,
        getQuoteById,
        loadingQuotes
      }}
    >
      {children}
    </QuotesContext.Provider>
  );
};
