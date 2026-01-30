
// src/app/(app)/configuracoes/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Settings, Mail, Save } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ConfiguracoesPage() {
  const { settings, updateSettings, loadingSettings } = useSettings();
  const { toast } = useToast();

  const [enableSalesNotifications, setEnableSalesNotifications] = useState(false);
  const [salesEmailList, setSalesEmailList] = useState('');
  
  useEffect(() => {
    if (!loadingSettings) {
      setEnableSalesNotifications(settings.enableSalesEmailNotifications);
      setSalesEmailList(settings.salesNotificationEmails.join(', '));
    }
  }, [settings, loadingSettings]);

  const handleSaveNotificationSettings = async () => {
    const salesEmails = salesEmailList
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      
    try {
        await updateSettings({
          enableSalesEmailNotifications: enableSalesNotifications,
          salesNotificationEmails: salesEmails,
        });

        toast({
          title: "Configurações de Notificação Salvas",
          description: "Suas preferências de notificação foram atualizadas.",
        });
    } catch(error) {
        toast({
            title: "Erro ao Salvar",
            description: "Não foi possível salvar as configurações.",
            variant: "destructive"
        });
    }
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
            Gerencie as preferências de notificação da aplicação.
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
              <CardFooter>
                <Button onClick={handleSaveNotificationSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações de Notificação
                </Button>
              </CardFooter>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
