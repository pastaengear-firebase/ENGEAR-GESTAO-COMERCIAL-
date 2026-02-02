
// app/(app)/dashboard/page.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ListChecks, TrendingUp, Printer, Banknote, BarChart3, Filter, FileText, FileSignature, Percent, AlertTriangle, CalendarCheck2 } from "lucide-react";
import SalesCharts from "@/components/sales/sales-charts";
import { useSales } from "@/hooks/use-sales";
import { useQuotes } from "@/hooks/use-quotes";
import { useState, useEffect, useMemo, useRef } from "react";
import type { Sale, Quote } from '@/lib/types';
import { ALL_SELLERS_OPTION } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { isBefore, subDays, parseISO } from 'date-fns';
import Link from "next/link";

const calculateWorkingDays = (from: Date, to: Date): number => {
  let count = 0;
  const currentDate = new Date(from);
  const endDate = new Date(to);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return count;
};

const getDisplayYears = (allSales: Sale[], allQuotes: Quote[]): Array<{ value: string; label: string }> => {
  const years = new Set<number>();
  allSales.forEach(sale => {
    const year = new Date(sale.date).getFullYear();
    if (year >= 2025) years.add(year);
  });
  allQuotes.forEach(quote => {
    const year = new Date(quote.proposalDate).getFullYear();
    if (year >= 2025) years.add(year);
  });
  const sortedYears = Array.from(years).sort((a, b) => b - a); 
  const options = [{ value: 'all', label: 'Todos os Anos' }];
  sortedYears.forEach(year => {
    options.push({ value: String(year), label: String(year) });
  });
  return options;
};

export default function DashboardPage() {
  const { sales: allSales, filteredSales, setFilters: setSalesFilters, viewingAsSeller, filters } = useSales();
  const { quotes: allQuotes, dashboardFilteredQuotes, setDashboardFilters: setQuotesDashboardFilters } = useQuotes();
  
  const [displayYear, setDisplayYear] = useState<string>('all'); 
  const yearOptions = useMemo(() => getDisplayYears(allSales, allQuotes), [allSales, allQuotes]);

  // Track current applied year to avoid redundant updates
  const lastAppliedYear = useRef<string | number | 'all' | null>(null);

  useEffect(() => {
    const validYearValues = yearOptions
      .map(opt => opt.value)
      .filter(val => val !== 'all' && parseInt(val) >= 2025);

    if (validYearValues.length > 0) {
      const latestValidYearOption = yearOptions.find(opt => opt.value !== 'all' && parseInt(opt.value) >= 2025);
      if (latestValidYearOption && displayYear === 'all') {
        setDisplayYear(latestValidYearOption.value);
      }
    }
  }, [yearOptions, displayYear]);

  useEffect(() => {
    const yearToFilter = displayYear === 'all' ? 'all' : parseInt(displayYear, 10);
    
    if (lastAppliedYear.current !== yearToFilter) {
        setSalesFilters({ selectedYear: yearToFilter });
        setQuotesDashboardFilters({ selectedYear: yearToFilter });
        lastAppliedYear.current = yearToFilter;
    }
  }, [displayYear, setSalesFilters, setQuotesDashboardFilters]);

  const dashboardSubtitle = viewingAsSeller === ALL_SELLERS_OPTION 
    ? "Visão geral do desempenho da equipe comercial." 
    : `Desempenho do vendedor: ${viewingAsSeller}`;

  const totalSalesValue = filteredSales.reduce((sum, sale) => sum + sale.salesValue, 0);
  const totalSalesCount = filteredSales.length;
  const totalPaymentsAllStatuses = filteredSales.reduce((sum, sale) => sum + sale.payment, 0);
  const totalProposedValue = dashboardFilteredQuotes.reduce((sum, quote) => sum + quote.proposedValue, 0);
  const totalProposalsCount = dashboardFilteredQuotes.length;

  const conversionRateValue = useMemo(() => {
    if (totalProposedValue > 0) return (totalSalesValue / totalProposedValue) * 100;
    return 0;
  }, [totalSalesValue, totalProposedValue]);

  const conversionRateCount = useMemo(() => {
    if (totalProposalsCount > 0) return (totalSalesCount / totalProposalsCount) * 100;
    return 0;
  }, [totalSalesCount, totalProposalsCount]);

  const workingDaysInPeriod = useMemo(() => {
    if (displayYear === 'all') {
      const combinedDates = [...allSales.map(s => new Date(s.date)), ...allQuotes.map(q => new Date(q.proposalDate))];
      if (combinedDates.length === 0) return 0;
      const yearsInData = combinedDates.map(d => d.getFullYear()).filter(y => y >= 2025);
      if (yearsInData.length === 0) return 0;
      const minYear = Math.min(...yearsInData);
      const maxYear = Math.max(...yearsInData);
      return calculateWorkingDays(new Date(minYear, 0, 1), new Date(maxYear, 11, 31));
    } else {
      const yearNum = parseInt(displayYear, 10);
      if (isNaN(yearNum)) return 0;
      return calculateWorkingDays(new Date(yearNum, 0, 1), new Date(yearNum, 11, 31));
    }
  }, [displayYear, allSales, allQuotes]);

  const averageSalesPerWorkingDay = useMemo(() => {
    if (workingDaysInPeriod > 0) return (totalSalesCount / workingDaysInPeriod).toFixed(2);
    return "0.00";
  }, [totalSalesCount, workingDaysInPeriod]);

  const averageProposalsPerWorkingDay = useMemo(() => {
    if (workingDaysInPeriod > 0) return (totalProposalsCount / workingDaysInPeriod).toFixed(2);
    return "0.00";
  }, [totalProposalsCount, workingDaysInPeriod]);

  const pendingBillingSales = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    return allSales.filter(sale => {
        const isCorrectSeller = viewingAsSeller === ALL_SELLERS_OPTION || sale.seller === viewingAsSeller;
        if (!isCorrectSeller) return false;
        try {
            const saleDate = parseISO(sale.date);
            const isPendingPayment = sale.payment < sale.salesValue;
            const isPendingStatus = sale.status === 'Á INICAR' || sale.status === 'EM ANDAMENTO';
            return isPendingPayment && isPendingStatus && isBefore(saleDate, thirtyDaysAgo);
        } catch (e) { return false; }
    });
  }, [allSales, viewingAsSeller]);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6" id="dashboard-printable-area">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard de Vendas e Propostas</h1>
          <p className="text-muted-foreground">{dashboardSubtitle}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 print-hide w-full sm:w-auto">
           <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Label htmlFor="year-select-dashboard" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Filtrar por Ano:
            </Label>
            <Select value={displayYear} onValueChange={setDisplayYear}>
              <SelectTrigger id="year-select-dashboard" className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="Selecionar ano" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handlePrint} variant="outline" size="icon" className="w-full sm:w-auto mt-2 sm:mt-0">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pendingBillingSales.length > 0 && (
            <Link href="/faturamento#cobranca" className="xl:col-span-1">
                <Card className="shadow-lg border-2 border-amber-500 bg-amber-50/80 dark:bg-amber-900/30 animate-pulse">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-800">Faturamentos Atrasados</CardTitle>
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900">{pendingBillingSales.length}</div>
                        <p className="text-xs text-muted-foreground">Vendas com mais de 30 dias pendentes.</p>
                    </CardContent>
                </Card>
            </Link>
        )}

        <Card><CardHeader><CardTitle className="text-sm">Valor Total de Vendas</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalSalesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Vendas Efetuadas</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalSalesCount}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Média Vendas/Dia Útil</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{averageSalesPerWorkingDay}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Total Recebido (Geral)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalPaymentsAllStatuses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Valor Total Orçado</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalProposedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Propostas Emitidas</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalProposalsCount}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Taxa Conversão (Valor)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{conversionRateValue.toFixed(2)}%</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Taxa Conversão (Qtd)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{conversionRateCount.toFixed(2)}%</div></CardContent></Card>
      </div>

      <SalesCharts salesData={filteredSales} />
    </div>
  );
}
