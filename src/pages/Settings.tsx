import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building, 
  CalendarClock, 
  CreditCard, 
  Globe, 
  Mail, 
  MapPin, 
  Phone, 
  Save, 
  Users, 
  Bell, 
  Settings as SettingsIcon,
  Clock
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Settings = () => {
  // Business information state
  const [businessName, setBusinessName] = useState("ShearHub Barbearia");
  const [address, setAddress] = useState("Av. Paulista, 1000, São Paulo - SP");
  const [phone, setPhone] = useState("(11) 98765-4321");
  const [email, setEmail] = useState("contato@shearhub.com");
  const [website, setWebsite] = useState("www.shearhub.com.br");
  const [description, setDescription] = useState("Barbearia moderna com serviços de qualidade para homens exigentes.");
  
  // Working hours
  const [workingHours, setWorkingHours] = useState({
    monday: { open: "09:00", close: "19:00", isOpen: true },
    tuesday: { open: "09:00", close: "19:00", isOpen: true },
    wednesday: { open: "09:00", close: "19:00", isOpen: true },
    thursday: { open: "09:00", close: "19:00", isOpen: true },
    friday: { open: "09:00", close: "20:00", isOpen: true },
    saturday: { open: "09:00", close: "18:00", isOpen: true },
    sunday: { open: "10:00", close: "16:00", isOpen: false },
  });

  // Notifications settings
  const [notifications, setNotifications] = useState({
    newAppointments: true,
    appointmentReminders: true,
    canceledAppointments: true,
    clientReviews: true,
    marketingEmails: false
  });
  
  // Payment settings
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    creditCard: true,
    debitCard: true,
    pix: true,
    bankTransfer: false
  });

  // Handle working hours change
  const handleHoursChange = (day: string, field: string, value: any) => {
    setWorkingHours({
      ...workingHours,
      [day]: {
        ...workingHours[day as keyof typeof workingHours],
        [field]: value
      }
    });
  };

  // Handle notification change
  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications({
      ...notifications,
      [key]: value
    });
  };

  // Handle payment method change
  const handlePaymentMethodChange = (key: string, value: boolean) => {
    setPaymentMethods({
      ...paymentMethods,
      [key]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Settings saved");
    // Here you would implement the logic to save settings
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
            <p className="text-muted-foreground">
              Gerencie as configurações da sua barbearia
            </p>
          </div>
        </div>

        <Tabs defaultValue="business" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="business">
              <Building className="h-4 w-4 mr-2" />
              Negócio
            </TabsTrigger>
            <TabsTrigger value="hours">
              <CalendarClock className="h-4 w-4 mr-2" />
              Horários
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="h-4 w-4 mr-2" />
              Pagamento
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Avançado
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Barbearia</CardTitle>
                <CardDescription>
                  Atualize as informações básicas do seu negócio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Nome da Barbearia</Label>
                    <Input
                      id="business-name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Endereço
                      </Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Telefone
                      </Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <Mail className="h-4 w-4 inline mr-1" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">
                        <Globe className="h-4 w-4 inline mr-1" />
                        Site
                      </Label>
                      <Input
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="bg-barber-gold hover:bg-barber-gold/80">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Horário de Funcionamento</CardTitle>
                <CardDescription>
                  Configure os horários de abertura e fechamento da sua barbearia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3">
                  <TooltipProvider>
                    {Object.entries(workingHours).map(([day, hours]) => (
                      <div
                        key={day}
                        className={`flex flex-col md:flex-row md:items-center md:space-x-4 p-2 rounded-lg transition-all ${hours.isOpen ? "bg-barber-gold/5" : "bg-muted/30"} border-b border-border last:border-b-0`}
                      >
                        <div className={`w-32 font-semibold text-base md:text-lg ${hours.isOpen ? "text-barber-gold" : "text-muted-foreground"}`}>
                          {getDayName(day)}
                        </div>
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <div>
                              <Switch
                                checked={hours.isOpen}
                                onCheckedChange={(checked) => handleHoursChange(day, 'isOpen', checked)}
                                className="scale-125 data-[state=checked]:bg-barber-gold"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {hours.isOpen ? "Aberto neste dia" : "Fechado neste dia"}
                          </TooltipContent>
                        </Tooltip>
                        <div className="grid grid-cols-2 gap-2 flex-1 mt-2 md:mt-0">
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <div className="relative">
                                <Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id={`${day}-open`}
                                  type="time"
                                  value={hours.open}
                                  onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                  disabled={!hours.isOpen}
                                  className={`pl-8 ${!hours.isOpen ? "opacity-60 cursor-not-allowed" : ""}`}
                                />
                              </div>
                            </TooltipTrigger>
                            {!hours.isOpen && (
                              <TooltipContent side="top">Ative o dia para editar o horário</TooltipContent>
                            )}
                          </Tooltip>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <div className="relative">
                                <Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id={`${day}-close`}
                                  type="time"
                                  value={hours.close}
                                  onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                  disabled={!hours.isOpen}
                                  className={`pl-8 ${!hours.isOpen ? "opacity-60 cursor-not-allowed" : ""}`}
                                />
                              </div>
                            </TooltipTrigger>
                            {!hours.isOpen && (
                              <TooltipContent side="top">Ative o dia para editar o horário</TooltipContent>
                            )}
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </TooltipProvider>
                  <div className="pt-4">
                    <Button type="submit" className="bg-barber-gold hover:bg-barber-gold/80">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>
                  Configure as formas de pagamento aceitas pela sua barbearia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {Object.entries(paymentMethods).map(([method, enabled]) => (
                    <div key={method} className="flex items-center justify-between py-2">
                      <Label htmlFor={`payment-${method}`} className="flex-1">
                        {getPaymentMethodLabel(method)}
                      </Label>
                      <Switch 
                        id={`payment-${method}`}
                        checked={enabled}
                        onCheckedChange={(checked) => handlePaymentMethodChange(method, checked)}
                      />
                    </div>
                  ))}

                  <div className="pt-4">
                    <Button type="submit" className="bg-barber-gold hover:bg-barber-gold/80">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>
                  Configure quais notificações deseja receber
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {Object.entries(notifications).map(([key, enabled]) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <Label htmlFor={`notification-${key}`} className="flex-1">
                        {getNotificationLabel(key)}
                      </Label>
                      <Switch 
                        id={`notification-${key}`}
                        checked={enabled}
                        onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                      />
                    </div>
                  ))}

                  <div className="pt-4">
                    <Button type="submit" className="bg-barber-gold hover:bg-barber-gold/80">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
                <CardDescription>
                  Configurações avançadas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h3 className="font-medium">Backup Automático</h3>
                      <p className="text-sm text-muted-foreground">Fazer backup automático dos dados diariamente</p>
                    </div>
                    <Switch id="backup" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h3 className="font-medium">Modo de Manutenção</h3>
                      <p className="text-sm text-muted-foreground">Desativa o acesso ao sistema para manutenção</p>
                    </div>
                    <Switch id="maintenance" />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h3 className="font-medium">Registro de Atividades</h3>
                      <p className="text-sm text-muted-foreground">Registrar todas as atividades do sistema</p>
                    </div>
                    <Switch id="logging" defaultChecked />
                  </div>
                  
                  <div className="pt-4">
                    <Button className="bg-destructive hover:bg-destructive/90">
                      Limpar Todos os Dados
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Helper functions
const getDayName = (day: string) => {
  const days: Record<string, string> = {
    monday: "Segunda",
    tuesday: "Terça",
    wednesday: "Quarta",
    thursday: "Quinta",
    friday: "Sexta",
    saturday: "Sábado",
    sunday: "Domingo"
  };
  return days[day] || day;
};

const getPaymentMethodLabel = (method: string) => {
  const methods: Record<string, string> = {
    cash: "Dinheiro",
    creditCard: "Cartão de Crédito",
    debitCard: "Cartão de Débito",
    pix: "PIX",
    bankTransfer: "Transferência Bancária"
  };
  return methods[method] || method;
};

const getNotificationLabel = (key: string) => {
  const notifications: Record<string, string> = {
    newAppointments: "Novos agendamentos",
    appointmentReminders: "Lembretes de agendamentos",
    canceledAppointments: "Agendamentos cancelados",
    clientReviews: "Avaliações de clientes",
    marketingEmails: "Emails de marketing"
  };
  return notifications[key] || key;
};

export default Settings;
