// src/app/(app)/configuracoes/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { useSales } from '@/hooks/use-sales'; // Import useSales
import { useQuotes } from '@/hooks/use-quotes'; // Import useQuotes
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Settings, Mail, Save, DatabaseZap, Trash2, FileText } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function ConfiguracoesPage() {
  const { settings, updateSettings, loadingSettings } = useSettings();
  const { sales, deleteSale } = useSales(); // Get all sales and delete function
  const { quotes, deleteQuote } = useQuotes(); // Get all quotes and delete function
  const { toast } = useToast();

  const [enableSalesNotifications, setEnableSalesNotifications] = useState(false);
  const [salesEmailList, setSalesEmailList] = useState('');
  const [enableProposalNotifications, setEnableProposalNotifications] = useState(false);
  const [proposalEmailList, setProposalEmailList] = useState('');

  useEffect(() => {
    if (!loadingSettings) {
      setEnableSalesNotifications(settings.enableSalesEmailNotifications);
      setSalesEmailList(settings.salesNotificationEmails.join(', '));
      setEnableProposalNotifications(settings.enableProposalEmailNotifications);
      setProposalEmailList(settings.proposalNotificationEmails.join(', '));
    }
  }, [settings, loadingSettings]);

  const handleSaveNotificationSettings = () => {
    const salesEmails = salesEmailList
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      
    const proposalEmails = proposalEmailList
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

    updateSettings({
      enableSalesEmailNotifications: enableSalesNotifications,
      salesNotificationEmails: salesEmails,
      enableProposalEmailNotifications: enableProposalNotifications,
      proposalNotificationEmails: proposalEmails,
    });

    toast({
      title: "Configurações de Notificação Salvas",
      description: "Suas preferências de notificação foram atualizadas.",
    });
  };

  const handleClearData = async (type: 'Vendas' | 'Propostas') => {
    try {
      if (type === 'Vendas') {
        // Use Promise.all to delete all sales concurrently
        await Promise.all(sales.map(sale => deleteSale(sale.id)));
        toast({
          title: `Dados de Vendas Limpos`,
          description: `Todos os dados de Vendas armazenados no Firebase foram removidos.`,
        });
      } else if (type === 'Propostas') {
        // Use Promise.all to delete all quotes concurrently
        await Promise.all(quotes.map(quote => deleteQuote(quote.id)));
        toast({
          title: `Dados de Propostas Limpos`,
          description: `Todos os dados de Propostas armazenados no Firebase foram removidos.`,
        });
      }
    } catch (error) {
       toast({
        title: `Erro ao Limpar Dados`,
        description: `Não foi possível remover os dados de ${type}. Tente novamente.`,
        variant: 'destructive'
      });
      console.error(`Error clearing ${type} data:`, error);
    }
    // No longer need to reload the page as useCollection will update automatically
  };


  if (loadingSettings) {
    return (
      <div className="flex justify-center items-center h-full">
        <Settings className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Settings className="mr-3 h-8 w-8" /> Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie as preferências e dados da aplicação.
          </p>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-xl font-semibold">
            <div className="flex items-center">
              <Mail className="mr-2 h-5 w-5 text-primary" /> Notificações por E-mail
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="shadow-none border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Novas Vendas</CardTitle>
                <CardDescription>
                  Controle o preparo de e-mails quando uma nova venda é inserida.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sales-email-notifications-toggle"
                    checked={enableSalesNotifications}
                    onCheckedChange={setEnableSalesNotifications}
                  />
                  <Label htmlFor="sales-email-notifications-toggle" className="text-base">
                    Habilitar preparação de e-mail para novas vendas
                  </Label>
                </div>
                {enableSalesNotifications && (
                  <div className="space-y-2">
                    <Label htmlFor="sales-notification-emails" className="text-base">
                      E-mails para Notificação de Vendas (separados por vírgula)
                    </Label>
                    <Textarea
                      id="sales-notification-emails"
                      placeholder="exemplo1@dominio.com, exemplo2@dominio.com"
                      value={salesEmailList}
                      onChange={(e) => setSalesEmailList(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                )}
              </CardContent>
              <CardHeader className="pb-2 pt-4">
                 <CardTitle className="text-lg flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/> Novas Propostas</CardTitle>
                <CardDescription>
                  Controle o preparo de e-mails quando uma nova proposta é criada ou atualizada.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="proposal-email-notifications-toggle"
                    checked={enableProposalNotifications}
                    onCheckedChange={setEnableProposalNotifications}
                  />
                  <Label htmlFor="proposal-email-notifications-toggle" className="text-base">
                    Habilitar preparação de e-mail para novas propostas
                  </Label>
                </div>
                {enableProposalNotifications && (
                  <div className="space-y-2">
                    <Label htmlFor="proposal-notification-emails" className="text-base">
                      E-mails para Notificação de Propostas (separados por vírgula)
                    </Label>
                    <Textarea
                      id="proposal-notification-emails"
                      placeholder="financeiro@dominio.com, diretor@dominio.com"
                      value={proposalEmailList}
                      onChange={(e) => setProposalEmailList(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveNotificationSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações de Notificação
                </Button>
              </CardFooter>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-xl font-semibold">
            <div className="flex items-center">
                <DatabaseZap className="mr-2 h-5 w-5 text-destructive" /> Gerenciamento de Dados do Banco
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="shadow-none border-0">
              <CardHeader>
                <CardTitle className="text-lg">Limpeza de Dados</CardTitle>
                <CardDescription>
                  Estas ações removerão permanentemente todos os dados do banco de dados (Firestore). Use com extrema cautela.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full sm:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" /> Limpar Todas as Vendas
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Limpeza Total</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir TODOS os dados de VENDAS do banco de dados? Esta ação é irreversível e afetará todos os usuários.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleClearData('Vendas')} className="bg-destructive hover:bg-destructive/90">
                          Confirmar Limpeza de Vendas
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="destructive" className="w-full sm:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" /> Limpar Todas as Propostas
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Limpeza Total</AlertDialogTitle>
                        <AlertDialogDescription>
                           Tem certeza que deseja excluir TODOS os dados de PROPOSTAS do banco de dados? Esta ação é irreversível e afetará todos os usuários.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleClearData('Propostas')} className="bg-destructive hover:bg-destructive/90">
                           Confirmar Limpeza de Propostas
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
