
// src/app/(app)/propostas/gerenciar/page.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useQuotes } from '@/hooks/use-quotes';
import { useSales } from '@/hooks/use-sales'; // Para selectedSeller
import QuoteForm from '@/components/quotes/quote-form';
import QuotesTable from '@/components/quotes/quotes-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, FileText, PlusCircle, RotateCcw, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Quote } from '@/lib/types';
import { ALL_SELLERS_OPTION } from '@/lib/constants';

export default function GerenciarPropostasPage() {
  const { quotes, deleteQuote, loadingQuotes, selectedSeller: quoteSellerContext } = useQuotes(); // selectedSeller aqui é do QuoteContext, derivado do SalesContext
  const { selectedSeller: globalSelectedSeller } = useSales(); // Este é o seletor global
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);

  const isEffectivelyReadOnly = globalSelectedSeller === ALL_SELLERS_OPTION;

  const filteredQuotes = useMemo(() => {
    let results = quotes;

    // Filtro por vendedor selecionado globalmente
    if (globalSelectedSeller !== ALL_SELLERS_OPTION) {
      results = results.filter(quote => quote.seller === globalSelectedSeller);
    }

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(quote =>
        quote.clientName.toLowerCase().includes(lowerSearchTerm) ||
        quote.description.toLowerCase().includes(lowerSearchTerm) ||
        quote.area.toLowerCase().includes(lowerSearchTerm) ||
        String(quote.proposedValue).includes(lowerSearchTerm)
      );
    }
    return results;
  }, [quotes, searchTerm, globalSelectedSeller]);

  const handleEditClick = (quote: Quote) => {
    if (isEffectivelyReadOnly) {
       toast({
        title: "Ação Não Permitida",
        description: "Selecione um vendedor específico (SERGIO ou RODRIGO) no seletor do cabeçalho para modificar propostas.",
        variant: "destructive",
      });
      return;
    }
    setEditingQuote(quote);
    setShowEditModal(true);
  };

  const confirmDelete = (id: string) => {
    if (isEffectivelyReadOnly) {
       toast({
        title: "Ação Não Permitida",
        description: "Selecione um vendedor específico (SERGIO ou RODRIGO) no seletor do cabeçalho para excluir propostas.",
        variant: "destructive",
      });
      return;
    }
    setQuoteToDelete(id);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (quoteToDelete) {
      deleteQuote(quoteToDelete);
      toast({ title: "Sucesso!", description: "Proposta excluída com sucesso." });
      if (editingQuote?.id === quoteToDelete) {
        setShowEditModal(false);
        setEditingQuote(null);
      }
      setQuoteToDelete(null);
    }
    setDialogOpen(false);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleFormSubmitted = () => {
    setShowEditModal(false);
    setEditingQuote(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <FileText className="mr-3 h-8 w-8" /> Gerenciar Propostas Comerciais
          </h1>
          <p className="text-muted-foreground">
            Visualize, busque, edite ou exclua propostas existentes.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/propostas/nova">
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Proposta
          </Link>
        </Button>
      </div>

      {isEffectivelyReadOnly && (
         <Alert variant="default" className="bg-amber-50 border-amber-300 text-amber-700">
          <Info className="h-4 w-4 !text-amber-600" />
          <AlertTitle>Funcionalidade Limitada</AlertTitle>
          <AlertDescription>
            Para modificar ou excluir propostas, por favor, selecione um vendedor específico (SERGIO ou RODRIGO) no seletor do cabeçalho.
            A visualização e busca estão habilitadas.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Buscar Propostas</CardTitle>
          <CardDescription>Digite o nome do cliente, descrição, área ou valor para filtrar.</CardDescription>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar propostas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button variant="outline" onClick={handleClearSearch} className="w-full sm:w-auto">
              <RotateCcw className="mr-2 h-4 w-4" /> Limpar Busca
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingQuotes && <p className="p-4 text-center">Carregando propostas...</p>}
          {!loadingQuotes && (
            <QuotesTable 
              quotesData={filteredQuotes} 
              onEdit={handleEditClick} 
              onDelete={confirmDelete}
              disabledActions={isEffectivelyReadOnly}
            />
          )}
        </CardContent>
         <CardFooter className="border-t p-4 text-sm text-muted-foreground">
            Total de Propostas Encontradas: <span className="font-semibold text-foreground">{filteredQuotes.length}</span>
        </CardFooter>
      </Card>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[750px] lg:max-w-[900px] max-h-[90vh]">
           <ScrollArea className="max-h-[85vh] p-1">
            <DialogHeader className="px-4 pt-4">
              <DialogTitle className="text-2xl">
                {editingQuote ? 'Modificar Proposta' : 'Nova Proposta'}
              </DialogTitle>
              <DialogDescription>
                {editingQuote ? `Alterando proposta para: ${editingQuote.clientName}` : 'Preencha os dados da nova proposta.'}
                {isEffectivelyReadOnly && " (Modo Somente Leitura)"}
              </DialogDescription>
            </DialogHeader>
            <div className="p-4">
              <QuoteForm 
                quoteToEdit={editingQuote} 
                onFormSubmit={handleFormSubmitted}
                showReadOnlyAlert={true} // O alerta de read-only será mostrado dentro do form se necessário
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQuoteToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
