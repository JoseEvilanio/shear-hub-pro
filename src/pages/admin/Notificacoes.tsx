
import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarbershopStats } from '@/types/admin';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from 'sonner';
import { AlertTriangle, Check, Send } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Mock data for late payments
const lateBarbershops: BarbershopStats[] = [
  {
    id: '1',
    name: 'Barbearia Vintage',
    city: 'São Paulo',
    status: 'active',
    payment_status: 'late',
    clientCount: 120,
    barberCount: 5,
    appointmentCount: 450,
    revenue: 15000,
    next_payment_date: '2025-05-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Cortes & Estilos',
    city: 'Rio de Janeiro',
    status: 'active',
    payment_status: 'late',
    clientCount: 85,
    barberCount: 3,
    appointmentCount: 320,
    revenue: 12000,
    next_payment_date: '2025-05-10T00:00:00Z'
  },
  {
    id: '3',
    name: 'Barba & Bigode',
    city: 'Belo Horizonte',
    status: 'blocked',
    payment_status: 'blocked',
    clientCount: 60,
    barberCount: 2,
    appointmentCount: 180,
    revenue: 7500,
    next_payment_date: '2025-04-30T00:00:00Z'
  }
];

// Template emails 
const emailTemplates = [
  {
    id: 'payment-reminder',
    name: 'Lembrete de Pagamento',
    subject: 'Lembrete: Pagamento pendente da sua assinatura',
    body: 'Olá {barbershop_name},\n\nEste é um lembrete amigável de que o pagamento da sua assinatura está pendente. O vencimento é {due_date}.\n\nPara continuar utilizando todos os recursos do ShearHub, por favor regularize seu pagamento.\n\nAtenciosamente,\nEquipe ShearHub'
  },
  {
    id: 'payment-overdue',
    name: 'Pagamento Atrasado',
    subject: 'IMPORTANTE: Pagamento atrasado da sua assinatura',
    body: 'Olá {barbershop_name},\n\nO pagamento da sua assinatura está atrasado. Para evitar a suspensão do serviço, por favor regularize seu pagamento o mais rápido possível.\n\nData de vencimento: {due_date}\n\nAtenciosamente,\nEquipe ShearHub'
  },
  {
    id: 'service-suspended',
    name: 'Serviço Suspenso',
    subject: 'Serviço suspenso: Pagamento pendente',
    body: 'Olá {barbershop_name},\n\nInformamos que seu acesso ao ShearHub foi suspenso devido à falta de pagamento.\n\nPara restaurar o acesso completo aos serviços, por favor regularize seu pagamento o mais rápido possível.\n\nAtenciosamente,\nEquipe ShearHub'
  }
];

export default function AdminNotifications() {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedBarbershops, setSelectedBarbershops] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  
  const handleSelectTemplate = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setEmailSubject(template.subject);
      setEmailBody(template.body);
    }
  };
  
  const handleSelectBarbershop = (id: string) => {
    setSelectedBarbershops(prev => 
      prev.includes(id) 
        ? prev.filter(shopId => shopId !== id)
        : [...prev, id]
    );
  };
  
  const handleSendToAllChange = (checked: boolean) => {
    setSendToAll(checked);
    if (checked) {
      setSelectedBarbershops(lateBarbershops.map(shop => shop.id));
    } else {
      setSelectedBarbershops([]);
    }
  };
  
  const handleSendNotifications = () => {
    if (selectedBarbershops.length === 0) {
      toast.error('Selecione pelo menos uma barbearia para enviar notificações.');
      return;
    }
    
    if (!emailSubject.trim()) {
      toast.error('O assunto do e-mail é obrigatório.');
      return;
    }
    
    if (!emailBody.trim()) {
      toast.error('O corpo do e-mail é obrigatório.');
      return;
    }
    
    // Simulate sending emails
    setSending(true);
    setSendProgress(0);
    
    const totalEmails = selectedBarbershops.length;
    let sentCount = 0;
    
    const interval = setInterval(() => {
      sentCount++;
      setSendProgress(Math.round((sentCount / totalEmails) * 100));
      
      if (sentCount >= totalEmails) {
        clearInterval(interval);
        setSending(false);
        toast.success(`${totalEmails} notificações enviadas com sucesso!`);
      }
    }, 500);
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Notificações</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notification Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Modelos de Notificação</CardTitle>
              <CardDescription>
                Selecione um modelo ou crie uma notificação personalizada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedTemplate} onValueChange={handleSelectTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Modelos</SelectLabel>
                    {emailTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <div className="space-y-2">
                <Label htmlFor="email-subject">Assunto do Email</Label>
                <Input 
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Assunto do email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-body">Corpo do Email</Label>
                <Textarea 
                  id="email-body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Conteúdo do email..."
                  className="min-h-[200px]"
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Tags disponíveis:</p>
                <p><code>{'{barbershop_name}'}</code> - Nome da barbearia</p>
                <p><code>{'{due_date}'}</code> - Data de vencimento</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle>Destinatários</CardTitle>
              <CardDescription>
                Selecione as barbearias para enviar notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="send-to-all" 
                  checked={sendToAll}
                  onCheckedChange={handleSendToAllChange}
                />
                <Label htmlFor="send-to-all">Enviar para todas as barbearias com pagamentos atrasados</Label>
              </div>
              
              <Alert className="bg-amber-50 text-amber-900 border-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  Existem {lateBarbershops.length} barbearias com pagamentos atrasados ou bloqueadas.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                {lateBarbershops.map(shop => (
                  <div key={shop.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`shop-${shop.id}`}
                      checked={selectedBarbershops.includes(shop.id)}
                      onChange={() => handleSelectBarbershop(shop.id)}
                    />
                    <Label htmlFor={`shop-${shop.id}`} className="flex-1">
                      {shop.name} - {shop.city}
                    </Label>
                    <Badge 
                      variant={shop.status === 'blocked' ? 'destructive' : 'outline'}
                      className="ml-auto"
                    >
                      {shop.status === 'blocked' ? 'Bloqueada' : 'Atrasado'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="pt-4">
              <Button 
                onClick={handleSendNotifications} 
                className="w-full" 
                disabled={sending || selectedBarbershops.length === 0}
              >
                {sending ? (
                  <>
                    <span className="mr-2">Enviando... {sendProgress}%</span>
                    <Progress value={sendProgress} className="h-2 w-20" />
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar {selectedBarbershops.length} notificações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Automatic notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações Automáticas</CardTitle>
            <CardDescription>
              Configure notificações automatizadas para diferentes eventos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Lembrete de pagamento (3 dias antes)</h4>
                <p className="text-sm text-muted-foreground">
                  Envia lembretes automáticos 3 dias antes do vencimento
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Notificação de pagamento atrasado</h4>
                <p className="text-sm text-muted-foreground">
                  Envia notificações quando o pagamento estiver 5 dias atrasado
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Alerta de bloqueio iminente</h4>
                <p className="text-sm text-muted-foreground">
                  Notifica quando a barbearia estiver prestes a ser bloqueada (15 dias atrasado)
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Relatório semanal de status</h4>
                <p className="text-sm text-muted-foreground">
                  Envia um relatório semanal com o status de todos os pagamentos
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Check className="h-4 w-4 mr-2" />
              Salvar configurações
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}

import { Badge } from '@/components/ui/badge';
