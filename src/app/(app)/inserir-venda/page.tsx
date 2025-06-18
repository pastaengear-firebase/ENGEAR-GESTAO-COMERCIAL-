// src/app/(app)/inserir-venda/page.tsx
"use client";
import SalesForm from '@/components/sales/sales-form';
import AISuggestions from '@/components/sales/ai-suggestions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from 'react';
import type { SuggestSalesImprovementsOutput } from '@/ai/flows/suggest-sales-improvements';
import type { SalesFormData } from '@/lib/schemas';
import { Lightbulb, Info } from 'lucide-react';
import { useSales } from '@/hooks/use-sales';
import { ALL_SELLERS_OPTION } from '@/lib/constants';

export default function InserirVendaPage() {
  const [aiSuggestions, setAiSuggestions] = useState<SuggestSalesImprovementsOutput | null>(null);
  const [currentFormData, setCurrentFormData] = useState<Partial<SalesFormData>>({});
  const { selectedSeller } = useSales();

  const isGlobalSellerEquipeComercial = selectedSeller === ALL_SELLERS_OPTION;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Inserir Nova Venda</h1>
      
      {isGlobalSellerEquipeComercial && (
        <Alert variant="default" className="bg-amber-50 border-amber-300 text-amber-700">
          <Info className="h-4 w-4 !text-amber-600" />
          <AlertTitle>Modo Somente Leitura Ativado</AlertTitle>
          <AlertDescription>
            Para inserir uma nova venda, por favor, selecione um vendedor específico (SERGIO ou RODRIGO) no seletor do cabeçalho.
            O formulário abaixo está desabilitado.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>Detalhes da Venda</CardTitle>
            <CardDescription>
              {isGlobalSellerEquipeComercial 
                ? "Selecione SERGIO ou RODRIGO no cabeçalho para habilitar." 
                : "Preencha todos os campos para registrar uma nova venda."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesForm 
              onFormChange={setCurrentFormData} 
              onSuggestionsFetched={setAiSuggestions} 
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg"> {/* This card will be full width on small screens, and 1/3 on lg screens */}
          <CardHeader className="flex flex-row items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Sugestões Inteligentes</CardTitle>
              <CardDescription>Melhorias sugeridas pela IA.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AISuggestions suggestions={aiSuggestions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
