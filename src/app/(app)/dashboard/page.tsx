// src/app/(app)/dashboard/page.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ListChecks, TrendingUp, Printer, CalendarDays, Banknote } from "lucide-react";
import SalesCharts from "@/components/sales/sales-charts";
import { useSales } from "@/hooks/use-sales";
import { DatePickerWithRange } from "@/components/ui/date-range-picker"; 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addDays, format, differenceInCalendarDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ALL_SELLERS_OPTION } from "@/lib/constants";

// A simple DatePickerWithRange - you'd typically have a more robust one
const SimpleDatePickerWithRange: React.FC<{
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  className?: string;
}> = ({ date, setDate, className }) => {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DatePickerWithRange
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const calculateWorkingDays = (from: Date, to: Date): number => {
  let count = 0;
  const currentDate = new Date(from);
  // Ensure 'to' date is inclusive by setting its time to end of day for comparison,
  // or just iterate while currentDate <= to (if 'to' is already start of day)
  const endDate = new Date(to);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return count;
};


export default function DashboardPage() {
  const { filteredSales, setFilters, filters, selectedSeller } = useSales();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    const fromDate = filters.startDate ? new Date(filters.startDate) : addDays(today, -30);
    const toDate = filters.endDate ? new Date(filters.endDate) : today;
    return { from: fromDate, to: toDate };
  });


  useEffect(() => {
    setFilters({ startDate: dateRange?.from, endDate: dateRange?.to });
  }, [dateRange, setFilters]);

  const dashboardSubtitle = selectedSeller === ALL_SELLERS_OPTION 
    ? "Visão geral do desempenho da equipe comercial." 
    : `Desempenho do vendedor: ${selectedSeller}`;

  const totalSalesValue = filteredSales.reduce((sum, sale) => sum + sale.salesValue, 0);
  const totalSalesCount = filteredSales.length;
  const totalPaymentsAllStatuses = filteredSales.reduce((sum, sale) => sum + sale.payment, 0);

  const workingDaysInRange = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      // Create new Date objects to avoid mutating the original dateRange state
      return calculateWorkingDays(new Date(dateRange.from), new Date(dateRange.to));
    }
    return 0;
  }, [dateRange]);

  const averageSalesPerWorkingDay = useMemo(() => {
    if (workingDaysInRange > 0 && totalSalesCount > 0) {
      return (totalSalesCount / workingDaysInRange).toFixed(2);
    }
    return "0.00";
  }, [totalSalesCount, workingDaysInRange]);


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
        <div className="flex items-center gap-2">
           <SimpleDatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button onClick={handlePrint} variant="outline" size="icon" className="print-hide">
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
            <p className="text-xs text-muted-foreground">No período selecionado</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <Banknote className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
             {totalPaymentsAllStatuses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">Soma de todos os pagamentos</p>
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
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageSalesPerWorkingDay}</div>
            <p className="text-xs text-muted-foreground">Vendas por dia útil no período</p>
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
          /* Add more print-specific styles here */
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
