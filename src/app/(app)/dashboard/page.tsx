// src/app/(app)/dashboard/page.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ListChecks, TrendingUp, Printer, CalendarDays, Banknote, BarChart3, Filter } from "lucide-react";
import SalesCharts from "@/components/sales/sales-charts";
import { useSales } from "@/hooks/use-sales";
import { useState, useEffect, useMemo } from "react";
import type { Sale } from '@/lib/types';
import { ALL_SELLERS_OPTION } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';

const calculateWorkingDays = (from: Date, to: Date): number => {
  let count = 0;
  const currentDate = new Date(from);
  const endDate = new Date(to);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return count;
};

const getDisplayYears = (allSales: Sale[]): Array<{ value: string; label: string }> => {
  const years = new Set<number>();
  allSales.forEach(sale => {
    const year = new Date(sale.date).getFullYear();
    if (year >= 2025) {
      years.add(year);
    }
  });
  const sortedYears = Array.from(years).sort((a, b) => b - a); // Descending for display
  const options = [{ value: 'all', label: 'Todos os Anos' }];
  sortedYears.forEach(year => {
    options.push({ value: String(year), label: String(year) });
  });
  return options;
};


export default function DashboardPage() {
  const { sales: allSales, filteredSales, setFilters, selectedSeller } = useSales();
  const [displayYear, setDisplayYear] = useState<string>('all'); 
  
  const yearOptions = useMemo(() => getDisplayYears(allSales), [allSales]);

  // Initialize displayYear to the most recent valid year (>=2025) or 'all'
  useEffect(() => {
    const validYearValues = yearOptions
      .map(opt => opt.value)
      .filter(val => val !== 'all' && parseInt(val) >= 2025);

    if (validYearValues.length > 0) {
      const latestValidYearOption = yearOptions.find(opt => opt.value !== 'all' && parseInt(opt.value) >= 2025);
      if (latestValidYearOption) {
        setDisplayYear(latestValidYearOption.value);
      } else {
        setDisplayYear('all'); // Fallback if no specific year found after filtering
      }
    } else {
      setDisplayYear('all'); // Default to 'all' if no years >= 2025
    }
  }, [yearOptions]);


  useEffect(() => {
    const yearToFilter = displayYear === 'all' ? 'all' : parseInt(displayYear, 10);
    setFilters({ selectedYear: yearToFilter });
  }, [displayYear, setFilters]);

  const dashboardSubtitle = selectedSeller === ALL_SELLERS_OPTION 
    ? "Visão geral do desempenho da equipe comercial." 
    : `Desempenho do vendedor: ${selectedSeller}`;

  const totalSalesValue = filteredSales.reduce((sum, sale) => sum + sale.salesValue, 0);
  const totalSalesCount = filteredSales.length;
  const totalPaymentsAllStatuses = filteredSales.reduce((sum, sale) => sum + sale.payment, 0);
  const totalPaymentsFinalizado = filteredSales
    .filter(sale => sale.status === 'FINALIZADO')
    .reduce((sum, sale) => sum + sale.payment, 0);


  const workingDaysInPeriod = useMemo(() => {
    if (displayYear === 'all') {
      if (allSales.length === 0) return 0;
      const yearsInSales = allSales
        .map(s => new Date(s.date).getFullYear())
        .filter(y => y >= 2025);
      if (yearsInSales.length === 0) return 0;
      
      const minYear = Math.min(...yearsInSales);
      const maxYear = Math.max(...yearsInSales);
      
      if (minYear === Infinity || maxYear === -Infinity || minYear > maxYear) return 0;
      return calculateWorkingDays(new Date(minYear, 0, 1), new Date(maxYear, 11, 31));
    } else {
      const yearNum = parseInt(displayYear, 10);
      if (isNaN(yearNum)) return 0;
      return calculateWorkingDays(new Date(yearNum, 0, 1), new Date(yearNum, 11, 31));
    }
  }, [displayYear, allSales]);

  const averageSalesPerWorkingDay = useMemo(() => {
    if (workingDaysInPeriod > 0 && totalSalesCount > 0) {
      return (totalSalesCount / workingDaysInPeriod).toFixed(2);
    }
    return "0.00";
  }, [totalSalesCount, workingDaysInPeriod]);


  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="dashboard-printable-area">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard de Vendas</h1>
          <p className="text-muted-foreground">{dashboardSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 print-hide">
           <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Label htmlFor="year-select-dashboard" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Filtrar por Ano:
            </Label>
            <Select
              value={displayYear}
              onValueChange={setDisplayYear}
            >
              <SelectTrigger id="year-select-dashboard" className="w-[180px] bg-background hover:bg-muted transition-colors duration-150 focus:ring-primary">
                <SelectValue placeholder="Selecionar ano" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handlePrint} variant="outline" size="icon">
            <Printer className="h-4 w-4" />
            <span className="sr-only">Imprimir Dashboard</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total de Vendas</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSalesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">
              {displayYear === 'all' ? 'Em todos os anos (desde 2025)' : `No ano de ${displayYear}`}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido (Geral)</CardTitle>
            <Banknote className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
             {totalPaymentsAllStatuses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">Soma de todos os pagamentos no período</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Efetuadas</CardTitle>
            <ListChecks className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSalesCount}</div>
            <p className="text-xs text-muted-foreground">Número de vendas no período</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Vendas / Dia Útil</CardTitle>
            <BarChart3 className="h-5 w-5 text-accent" /> {/* Changed icon */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageSalesPerWorkingDay}</div>
            <p className="text-xs text-muted-foreground">
              {displayYear === 'all' ? 'Considerando todos os dias úteis nos anos com vendas (desde 2025)' : `Em dias úteis de ${displayYear}`}
            </p>
          </CardContent>
        </Card>
      </div>

      <SalesCharts salesData={filteredSales} />
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #dashboard-printable-area, #dashboard-printable-area * {
            visibility: visible;
          }
          #dashboard-printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 10mm; /* A4 padding */
            font-size: 10pt;
          }
          .print-hide {
            display: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}

