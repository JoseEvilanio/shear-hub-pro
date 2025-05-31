
import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { SubscriptionPlan } from '@/types/admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adminApi } from '@/services/admin-api';
import { useEffect } from 'react';
import { Check, Edit, FileSpreadsheet, RefreshCw, Save, Trash2 } from 'lucide-react';

export default function AdminSettings() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load plans
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await adminApi.getSubscriptionPlans();
        setPlans(data);
      } catch (err) {
        console.error('Error loading subscription plans:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlans();
  }, []);
  
  const handleSaveSettings = () => {
    toast.success('Configurações salvas com sucesso!');
  };
  
  const handleSavePlan = () => {
    toast.success('Plano salvo com sucesso!');
  };
  
  const handleDeletePlan = () => {
    toast.success('Plano excluído com sucesso!');
  };
  
  const handleExportData = () => {
    toast.success('Dados exportados com sucesso!');
  };
  
  const handleBackupData = () => {
    toast.success('Backup realizado com sucesso!');
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general" className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configurações básicas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input id="company-name" defaultValue="ShearHub" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email de Contato</Label>
                  <Input id="contact-email" defaultValue="contato@shearhub.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="support-phone">Telefone de Suporte</Label>
                  <Input id="support-phone" defaultValue="(11) 99999-9999" />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance-mode">Modo de Manutenção</Label>
                    <Switch id="maintenance-mode" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ativa o modo de manutenção para todos os usuários exceto administradores
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-registrations">Permitir Novos Registros</Label>
                    <Switch id="new-registrations" defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Permite o registro de novas barbearias no sistema
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleSaveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Subscription Plans */}
          <TabsContent value="plans" className="mt-4 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Planos de Assinatura</CardTitle>
                  <CardDescription>
                    Gerenciar planos disponíveis para barbearias
                  </CardDescription>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Adicionar Plano</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Plano</DialogTitle>
                      <DialogDescription>
                        Crie um novo plano de assinatura para barbearias
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="plan-name">Nome do Plano</Label>
                        <Input id="plan-name" placeholder="Ex: Profissional" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="plan-price">Preço (R$)</Label>
                          <Input id="plan-price" type="number" placeholder="199.90" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="plan-duration">Duração (dias)</Label>
                          <Input id="plan-duration" type="number" placeholder="30" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="plan-description">Descrição</Label>
                        <Textarea id="plan-description" placeholder="Descreva os benefícios deste plano..." />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Recursos Incluídos</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="feature-scheduling" />
                            <Label htmlFor="feature-scheduling">Agendamento online</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="feature-analytics" />
                            <Label htmlFor="feature-analytics">Relatórios e analytics</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="feature-marketing" />
                            <Label htmlFor="feature-marketing">Ferramentas de marketing</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button onClick={handleSavePlan}>Salvar Plano</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="pt-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {plans.map((plan) => (
                      <Card key={plan.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold">{formatCurrency(plan.price)}</span>
                            <span className="text-muted-foreground">
                              {plan.duration_days === 30 ? 'Mensal' : 
                              plan.duration_days === 365 ? 'Anual' : 
                              `${plan.duration_days} dias`}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                          
                          <div className="mt-4">
                            <p className="text-sm font-medium">Recursos:</p>
                            <ul className="text-sm space-y-1 mt-1">
                              {plan.features && typeof plan.features === 'object' && Object.entries(plan.features).map(([key, value]) => (
                                <li key={key} className="flex items-center">
                                  {value === true ? (
                                    <Check className="h-4 w-4 mr-2 text-green-500" />
                                  ) : (
                                    <span className="h-4 w-4 mr-2" />
                                  )}
                                  {key === 'max_barbers' 
                                    ? `Até ${value} barbeiros`
                                    : key === 'online_scheduling'
                                      ? 'Agendamento online'
                                      : key === 'analytics'
                                        ? 'Relatórios e analytics'
                                        : key === 'marketing_tools'
                                          ? 'Ferramentas de marketing'
                                          : key}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Email Settings */}
          <TabsContent value="emails" className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Email</CardTitle>
                <CardDescription>
                  Configure os servidores e modelos de email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-server">Servidor SMTP</Label>
                  <Input id="smtp-server" placeholder="smtp.example.com" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Porta</Label>
                    <Input id="smtp-port" placeholder="587" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtp-security">Segurança</Label>
                    <Select defaultValue="tls">
                      <SelectTrigger id="smtp-security">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="tls">TLS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">Usuário SMTP</Label>
                  <Input id="smtp-username" placeholder="seu-email@example.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Senha SMTP</Label>
                  <Input id="smtp-password" type="password" placeholder="••••••••" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="from-email">Email de Envio</Label>
                  <Input id="from-email" placeholder="noreply@shearhub.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="from-name">Nome de Envio</Label>
                  <Input id="from-name" placeholder="ShearHub" />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="test-email">Email para Teste</Label>
                    <Button variant="outline" size="sm">Enviar Teste</Button>
                  </div>
                  <Input id="test-email" placeholder="seu-email@example.com" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleSaveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* System Settings */}
          <TabsContent value="system" className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup e Exportação</CardTitle>
                <CardDescription>
                  Faça backup e exporte dados do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Exportar dados em CSV</h3>
                  <p className="text-sm text-muted-foreground">
                    Exporte dados das entidades principais do sistema
                  </p>
                  <div className="flex flex-col space-y-2 mt-2">
                    <Button variant="outline" className="justify-start" onClick={handleExportData}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Exportar barbearias
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={handleExportData}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Exportar usuários
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={handleExportData}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Exportar pagamentos
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={handleExportData}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Exportar agendamentos
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Backup do sistema</h3>
                  <p className="text-sm text-muted-foreground">
                    Realize backup completo do banco de dados
                  </p>
                  <Button onClick={handleBackupData} className="mt-2">
                    Realizar backup agora
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Backup automático</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-backup">Ativar backup automático</Label>
                    <Switch id="auto-backup" defaultChecked />
                  </div>
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="backup-frequency">Frequência</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="backup-frequency">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">A cada hora</SelectItem>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200">
              <CardHeader className="text-red-500">
                <CardTitle>Zona de Perigo</CardTitle>
                <CardDescription className="text-red-400">
                  Ações que podem afetar permanentemente o sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Limpar dados de cache</h3>
                  <p className="text-sm text-muted-foreground">
                    Limpa os dados de cache do sistema, pode causar lentidão temporária
                  </p>
                  <Button variant="outline" className="mt-2">
                    Limpar cache
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Reiniciar serviços</h3>
                  <p className="text-sm text-muted-foreground">
                    Reinicia os serviços do sistema, temporariamente indisponível para os usuários
                  </p>
                  <Button variant="outline" className="mt-2">
                    Reiniciar serviços
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium text-red-500">Resetar Database</h3>
                  <p className="text-sm text-red-400">
                    ATENÇÃO: Esta ação irá limpar TODOS os dados do sistema e é irreversível!
                  </p>
                  <Button variant="destructive" className="mt-2">
                    Resetar Database
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
