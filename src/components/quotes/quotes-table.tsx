// src/components/quotes/quotes-table.tsx
"use client";
import type { Quote } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit3, Trash2, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface QuotesTableProps {
  quotesData: Quote[];
  onEdit: (quote: Quote) => void;
  onDelete: (quoteId: string) => void;
  disabledActions: boolean;
}

export default function QuotesTable({ quotesData, onEdit, onDelete, disabledActions }: QuotesTableProps) {

  const getStatusBadgeVariant = (status: Quote['status']): React.ComponentProps<typeof Badge>['variant'] => {
    switch (status) {
      case 'Aceita':
        return 'default'; // Verde (ou cor primária)
      case 'Enviada':
      case 'Em Negociação':
        return 'secondary'; // Amarelo/Laranja
      case 'Recusada':
      case 'Cancelada':
        return 'destructive'; // Vermelho
      case 'Pendente':
      default:
        return 'outline'; // Cinza/Neutro
    }
  };

  if (!quotesData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4 border border-dashed rounded-lg">
        <Eye className="h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="text-lg font-semibold text-foreground">Nenhuma Proposta Encontrada</h3>
        <p className="text-sm text-muted-foreground">
          Não há propostas que correspondam aos filtros atuais ou nenhuma proposta foi adicionada ainda.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="whitespace-nowrap rounded-md border">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Área</TableHead>
            <TableHead className="text-right">Valor Proposto</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotesData.map((quote) => (
            <TableRow key={quote.id} className="hover:bg-muted/50 transition-colors">
              <TableCell>{format(parseISO(quote.proposalDate), 'dd/MM/yy', { locale: ptBR })}</TableCell>
              <TableCell className="font-medium max-w-[200px] truncate" title={quote.clientName}>{quote.clientName}</TableCell>
              <TableCell>{quote.seller}</TableCell>
              <TableCell>{quote.area}</TableCell>
              <TableCell className="text-right">
                {quote.proposedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(quote.status)} className="capitalize text-xs px-2 py-0.5">
                  {quote.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={disabledActions}>
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(quote)} disabled={disabledActions}>
                      <Edit3 className="mr-2 h-4 w-4" /> Modificar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(quote.id)} className="text-destructive" disabled={disabledActions}>
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

