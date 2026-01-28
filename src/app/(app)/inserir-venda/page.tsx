// src/app/(app)/inserir-venda/page.tsx
"use client";
import SalesForm from '@/components/sales/sales-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';
import { useSales } from '@/hooks/use-sales';

export default function InserirVendaPage() {
  const { isReadOnly } = useSales();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Inserir Nova Venda</h1>
      
      {isReadOnly && (
        <Alert variant="default" className="bg-amber-50 border-amber-300 text-amber-700">
          <Info className="h-4 w-4 !text-amber-600" />
          <AlertTitle>Ação Necessária</AlertTitle>
          <AlertDescription>
            Para inserir uma nova venda, por favor, faça login com uma conta de vendedor autorizada (SERGIO ou RODRIGO).
            O formulário abaixo está desabilitado.
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Detalhes da Venda</CardTitle>
          <CardDescription>
            {isReadOnly
              ? "Faça login com um usuário de vendas para habilitar." 
              : "Preencha todos os campos para registrar uma nova venda."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SalesForm />
        </CardContent>
      </Card>
    </div>
  );
}
