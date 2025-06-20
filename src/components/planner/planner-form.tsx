
// src/components/planner/planner-form.tsx
"use client";
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlannerFormSchema, type PlannerFormData } from '@/lib/schemas';
import { PLANNER_STATUS_OPTIONS, PLANNER_PRIORITY_OPTIONS, SELLERS, ALL_SELLERS_OPTION } from '@/lib/constants';
import type { Seller } from '@/lib/constants';
import { usePlanner } from '@/hooks/use-planner';
import { useSales } from '@/hooks/use-sales';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Save, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import type { PlannerItem } from '@/lib/types';

interface PlannerFormProps {
  itemToEdit?: PlannerItem | null;
  onFormSubmit?: () => void; 
  isReadOnly: boolean; // Passed from parent page based on globalSelectedSeller
}

export default function PlannerForm({ itemToEdit, onFormSubmit, isReadOnly }: PlannerFormProps) {
  const { addPlannerItem, updatePlannerItem } = usePlanner();
  const { selectedSeller: globalSelectedSeller } = useSales();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayedSeller, setDisplayedSeller] = useState<Seller | typeof ALL_SELLERS_OPTION | undefined>(undefined);

  const editMode = !!itemToEdit;

  const form = useForm<PlannerFormData>({
    resolver: zodResolver(PlannerFormSchema),
    defaultValues: {
      title: '',
      clientName: '',
      status: "Pendente",
      priority: "Média",
      deadline: undefined,
      notes: '',
    },
  });

  useEffect(() => {
    if (editMode && itemToEdit) {
      form.reset({
        title: itemToEdit.title,
        clientName: itemToEdit.clientName || '',
        status: itemToEdit.status,
        priority: itemToEdit.priority,
        deadline: parseISO(itemToEdit.deadline),
        notes: itemToEdit.notes || '',
      });
      setDisplayedSeller(itemToEdit.responsibleSeller);
    } else if (!editMode) {
      form.reset({ 
        title: '',
        clientName: '',
        status: "Pendente",
        priority: "Média",
        deadline: undefined,
        notes: '',
      });
      form.setValue('deadline', new Date(), { shouldValidate: true, shouldDirty: true });
      
      if (SELLERS.includes(globalSelectedSeller as Seller)) {
        setDisplayedSeller(globalSelectedSeller as Seller);
      } else {
        setDisplayedSeller(ALL_SELLERS_OPTION); // Should be disabled if this is the case
      }
    }
  }, [itemToEdit, editMode, form, globalSelectedSeller]);

  const onSubmit = async (data: PlannerFormData) => {
    if (isReadOnly) { 
       toast({
        title: "Ação Não Permitida",
        description: "Selecione um vendedor específico (SERGIO ou RODRIGO) no seletor do cabeçalho para salvar itens no planner.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!data.deadline) {
        toast({ title: "Erro de Validação", description: "Prazo é obrigatório.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    setIsSubmitting(true);
    
    const payload = {
      ...data,
      deadline: format(data.deadline, 'yyyy-MM-dd'),
    };

    try {
      if (editMode && itemToEdit) {
        // Ensure responsibleSeller is not changed through this form
        updatePlannerItem(itemToEdit.id, payload as Partial<Omit<PlannerItem, 'id' | 'createdAt' | 'updatedAt' | 'responsibleSeller'>>);
        toast({ title: "Sucesso!", description: "Item do planner atualizado." });
      } else {
        // addPlannerItem will use globalSelectedSeller from context
        addPlannerItem(payload as Omit<PlannerItem, 'id' | 'createdAt' | 'updatedAt' | 'responsibleSeller'>);
        toast({ title: "Sucesso!", description: "Novo item adicionado ao planner." });
      }
      
      form.reset({ 
        title: '', clientName: '', status: "Pendente", priority: "Média", deadline: undefined, notes: '' 
      });
      if (!editMode) {
        form.setValue('deadline', new Date(), { shouldValidate: true, shouldDirty: true });
      }
      
      if (SELLERS.includes(globalSelectedSeller as Seller)) {
        setDisplayedSeller(globalSelectedSeller as Seller);
      } else {
        setDisplayedSeller(ALL_SELLERS_OPTION);
      }
      
      if (onFormSubmit) {
        onFormSubmit();
      }

    } catch (error) {
      console.error("Error saving planner item:", error);
      toast({ 
        title: "Erro ao Salvar", 
        description: `Ocorreu um erro: ${(error as Error).message}.`, 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Tarefa</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Preparar proposta para Empresa ABC" 
                  {...field} 
                  disabled={isReadOnly || isSubmitting} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente (Opcional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nome do cliente ou contato" 
                    {...field} 
                    disabled={isReadOnly || isSubmitting} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Responsável</FormLabel>
            <Select value={displayedSeller || ""} disabled>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Definido no cabeçalho" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SELLERS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                {/* <SelectItem value={ALL_SELLERS_OPTION}>{ALL_SELLERS_OPTION}</SelectItem> */}
              </SelectContent>
            </Select>
            <FormDescription>
              {editMode ? "Responsável original." : "Definido no cabeçalho."}
            </FormDescription>
          </FormItem>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Prazo</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        disabled={isReadOnly || isSubmitting}
                      >
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                        mode="single" 
                        selected={field.value || undefined}
                        onSelect={field.onChange} 
                        initialFocus 
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || isReadOnly || isSubmitting} 
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly || isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o Status" /></SelectTrigger></FormControl>
                  <SelectContent>{PLANNER_STATUS_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly || isSubmitting}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione a Prioridade" /></SelectTrigger></FormControl>
                  <SelectContent>{PLANNER_PRIORITY_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
          
        <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações (Opcional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Detalhes adicionais, links, próximos passos..." {...field} disabled={isReadOnly || isSubmitting} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
        />
        
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              form.reset({ 
                title: '', clientName: '', status: "Pendente", priority: "Média", deadline: undefined, notes: '' 
              });
              if (!editMode) {
                 form.setValue('deadline', new Date(), { shouldValidate: true, shouldDirty: true });
              }
              if (onFormSubmit && editMode) onFormSubmit(); // Close modal if editing
            }}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {editMode ? 'Cancelar Edição' : 'Limpar Formulário'}
          </Button>
          <Button type="submit"
            disabled={isReadOnly || isSubmitting} 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Salvando...' : (editMode ? 'Atualizar Item' : 'Salvar Item')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
