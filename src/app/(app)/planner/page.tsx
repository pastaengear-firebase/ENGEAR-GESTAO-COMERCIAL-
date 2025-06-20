
// src/app/(app)/planner/page.tsx
"use client";
import type React from 'react';
import { useState } from 'react';
import { usePlanner } from '@/hooks/use-planner';
import { useSales } from '@/hooks/use-sales';
import PlannerTable from '@/components/planner/planner-table';
import PlannerForm from '@/components/planner/planner-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, PlusCircle, Search, RotateCcw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PlannerItem } from '@/lib/types';
import { ALL_SELLERS_OPTION } from '@/lib/constants';

export default function PlannerPage() {
  const { 
    filteredPlannerItems, 
    setPlannerSearchTerm, 
    plannerSearchTerm,
    deletePlannerItem, 
    loadingPlanner 
  } = usePlanner();
  const { selectedSeller: globalSelectedSeller } = useSales();
  const { toast } = useToast();

  const [editingItem, setEditingItem] = useState<PlannerItem | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const isEffectivelyReadOnly = globalSelectedSeller === ALL_SELLERS_OPTION;

  const handleAddNewItem = () => {
    if (isEffectivelyReadOnly) {
      toast({
        title: "Ação Não Permitida",
        description: "Selecione um vendedor específico (SERGIO ou RODRIGO) no seletor do cabeçalho para adicionar um novo item ao planner.",
        variant: "destructive",
      });
      return;
    }
    setEditingItem(null);
    setShowFormModal(true);
  };

  const handleEditItem = (item: PlannerItem) => {
    if (isEffectivelyReadOnly || item.responsibleSeller !== globalSelectedSeller) {
       toast({
        title: "Ação Não Permitida",
        description: "Você só pode editar itens atribuídos a você. Selecione seu nome no seletor do cabeçalho.",
        variant: "destructive",
      });
      return;
    }
    setEditingItem(item);
    setShowFormModal(true);
  };

  const confirmDeleteItem = (id: string, responsibleSeller: string) => {
     if (isEffectivelyReadOnly || responsibleSeller !== globalSelectedSeller) {
       toast({
        title: "Ação Não Permitida",
        description: "Você só pode excluir itens atribuídos a você. Selecione seu nome no seletor do cabeçalho.",
        variant: "destructive",
      });
      return;
    }
    setItemToDelete(id);
    setShowDeleteConfirmDialog(true);
  };

  const handleDeleteConfirmed = () => {
    if (itemToDelete) {
      deletePlannerItem(itemToDelete);
      toast({ title: "Sucesso!", description: "Item do planner excluído com sucesso." });
      if (editingItem?.id === itemToDelete) {
        setShowFormModal(false);
        setEditingItem(null);
      }
      setItemToDelete(null);
    }
    setShowDeleteConfirmDialog(false);
  };
  
  const handleClearSearch = () => {
    setPlannerSearchTerm('');
  };

  const handleFormSubmitted = () => {
    setShowFormModal(false);
    setEditingItem(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <ClipboardList className="mr-3 h-8 w-8" /> Planner de Propostas
          </h1>
          <p className="text-muted-foreground">
            Gerencie tarefas e prazos para elaboração de propostas.
          </p>
        </div>
        <Button onClick={handleAddNewItem} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isEffectivelyReadOnly}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Item
        </Button>
      </div>

      {isEffectivelyReadOnly && (
         <Alert variant="default" className="bg-amber-50 border-amber-300 text-amber-700">
          <Info className="h-4 w-4 !text-amber-600" />
          <AlertTitle>Funcionalidade Limitada</AlertTitle>
          <AlertDescription>
            Para adicionar, modificar ou excluir itens, por favor, selecione um vendedor específico (SERGIO ou RODRIGO) no seletor do cabeçalho.
            A visualização e busca estão habilitadas.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Buscar Itens no Planner</CardTitle>
          <CardDescription>Digite o título da tarefa ou nome do cliente para filtrar.</CardDescription>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar tarefas..."
                value={plannerSearchTerm}
                onChange={(e) => setPlannerSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button variant="outline" onClick={handleClearSearch} className="w-full sm:w-auto">
              <RotateCcw className="mr-2 h-4 w-4" /> Limpar Busca
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingPlanner && <p className="p-4 text-center">Carregando planner...</p>}
          {!loadingPlanner && (
            <PlannerTable 
              plannerItems={filteredPlannerItems}
              onEdit={handleEditItem} 
              onDelete={confirmDeleteItem}
              disabledActions={isEffectivelyReadOnly}
            />
          )}
        </CardContent>
         <CardFooter className="border-t p-4 text-sm text-muted-foreground">
            Total de Itens Encontrados: <span className="font-semibold text-foreground">{filteredPlannerItems.length}</span>
        </CardFooter>
      </Card>

      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="sm:max-w-[600px] md:max-w-[700px] max-h-[90vh]">
           <ScrollArea className="max-h-[85vh] p-1">
            <DialogHeader className="px-4 pt-4">
              <DialogTitle className="text-2xl">
                {editingItem ? 'Modificar Item do Planner' : 'Novo Item no Planner'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? `Alterando item: ${editingItem.title}` : 'Preencha os dados da nova tarefa.'}
                {isEffectivelyReadOnly && " (Modo Somente Leitura)"}
              </DialogDescription>
            </DialogHeader>
            <div className="p-4">
              <PlannerForm
                itemToEdit={editingItem} 
                onFormSubmit={handleFormSubmitted}
                isReadOnly={isEffectivelyReadOnly}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este item do planner? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
                <Button variant="outline" onClick={() => setItemToDelete(null)}>Cancelar</Button>
            </DialogClose>
            <Button onClick={handleDeleteConfirmed} variant="destructive">
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
