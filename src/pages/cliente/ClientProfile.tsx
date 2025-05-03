
import { useState } from "react";
import { ClientLayout } from "@/components/layout/client-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { User, Lock, Bell, MapPin, Upload, Save, LogOut } from "lucide-react";
import { toast } from "sonner";

const ClientProfile = () => {
  const [activeTab, setActiveTab] = useState("perfil");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Mock dos dados do usuário
  const [userData, setUserData] = useState({
    name: "João Silva",
    email: "joao@example.com",
    phone: "(11) 98765-4321",
    birthDate: "1990-05-15",
    gender: "masculino",
    bio: "Cliente desde 2025.",
    address: "Av. Paulista, 1000, Apto 123",
    city: "São Paulo",
    state: "SP",
    preferredPayment: "credit",
    notifications: {
      email: true,
      push: true,
      sms: false,
      reminders: true,
      marketing: false,
      loyalty: true
    }
  });
  
  // Função para salvar alterações
  const handleSaveChanges = () => {
    setIsSaving(true);
    
    // Simulando uma chamada de API
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    }, 1000);
  };
  
  // Função para alterar senha
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Senha alterada com sucesso!");
  };
  
  // Função para deslogar
  const handleLogout = () => {
    toast.success("Você saiu da sua conta");
    // Em uma aplicação real, redirecionaria para a página de login
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e preferências
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="bg-barber-gold hover:bg-barber-gold/90" 
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Editar Perfil
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="perfil" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-fit">
            <TabsTrigger value="perfil">
              <User className="mr-2 h-4 w-4" />
              Dados Pessoais
            </TabsTrigger>
            <TabsTrigger value="seguranca">
              <Lock className="mr-2 h-4 w-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="preferencias">
              <Bell className="mr-2 h-4 w-4" />
              Preferências
            </TabsTrigger>
          </TabsList>
          
          {/* Tab de Dados Pessoais */}
          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Foto e Informações Básicas</CardTitle>
                <CardDescription>
                  Atualize sua foto e informações de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl bg-barber-gold">JS</AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Foto de Perfil</h3>
                    <div className="text-sm text-muted-foreground">
                      Sua foto será exibida em seu perfil e nos agendamentos.
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={!isEditing}>
                        <Upload className="mr-2 h-4 w-4" />
                        Carregar Foto
                      </Button>
                      <Button variant="outline" size="sm" disabled={!isEditing}>
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={userData.name}
                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={userData.phone}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={userData.birthDate}
                        onChange={(e) => setUserData({...userData, birthDate: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Gênero</Label>
                      <RadioGroup
                        value={userData.gender}
                        onValueChange={(value) => setUserData({...userData, gender: value})}
                        disabled={!isEditing}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="masculino" id="masculino" />
                          <Label htmlFor="masculino">Masculino</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="feminino" id="feminino" />
                          <Label htmlFor="feminino">Feminino</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="outro" id="outro" />
                          <Label htmlFor="outro">Outro</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Biografia</Label>
                      <Textarea
                        id="bio"
                        value={userData.bio}
                        onChange={(e) => setUserData({...userData, bio: e.target.value})}
                        disabled={!isEditing}
                        placeholder="Conte um pouco sobre você..."
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>
                  Atualize seu endereço para facilitar os agendamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Input
                      id="address"
                      value={userData.address}
                      onChange={(e) => setUserData({...userData, address: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Rua, número, complemento"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={userData.city}
                      onChange={(e) => setUserData({...userData, city: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={userData.state}
                      onChange={(e) => setUserData({...userData, state: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                {isEditing && (
                  <Button variant="outline" className="mt-2">
                    <MapPin className="mr-2 h-4 w-4" />
                    Usar localização atual
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Método de Pagamento Preferido</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={userData.preferredPayment}
                  onValueChange={(value) => setUserData({...userData, preferredPayment: value})}
                  disabled={!isEditing}
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3 mb-3">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit">Cartão de Crédito</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3 mb-3">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix">PIX</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Dinheiro</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab de Segurança */}
          <TabsContent value="seguranca">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha periodicamente para manter sua conta segura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirme a Nova Senha</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  
                  <Button type="submit" className="bg-barber-gold hover:bg-barber-gold/90">
                    Alterar Senha
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-red-500">Ações Perigosas</CardTitle>
                <CardDescription>
                  Ações que afetam permanentemente sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/10">
                  <h3 className="font-medium text-red-500">Excluir Conta</h3>
                  <p className="text-sm text-red-500/80 mt-1 mb-4">
                    Esta ação irá excluir permanentemente sua conta e todos os dados associados. Esta ação é irreversível.
                  </p>
                  <Button variant="destructive">
                    Excluir minha conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab de Preferências */}
          <TabsContent value="preferencias">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Gerencie como e quando você deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Notificações por E-mail</h3>
                      <p className="text-sm text-muted-foreground">
                        Receber comunicações e alertas por e-mail
                      </p>
                    </div>
                    <Switch
                      checked={userData.notifications.email}
                      onCheckedChange={(checked) => 
                        setUserData({
                          ...userData, 
                          notifications: {...userData.notifications, email: checked}
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Notificações Push</h3>
                      <p className="text-sm text-muted-foreground">
                        Notificações em tempo real no seu dispositivo
                      </p>
                    </div>
                    <Switch
                      checked={userData.notifications.push}
                      onCheckedChange={(checked) => 
                        setUserData({
                          ...userData, 
                          notifications: {...userData.notifications, push: checked}
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Notificações por SMS</h3>
                      <p className="text-sm text-muted-foreground">
                        Receber alertas por mensagem de texto
                      </p>
                    </div>
                    <Switch
                      checked={userData.notifications.sms}
                      onCheckedChange={(checked) => 
                        setUserData({
                          ...userData, 
                          notifications: {...userData.notifications, sms: checked}
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <h3 className="font-medium mb-3">Tipos de Comunicação</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Lembretes de Agendamentos</h4>
                        <p className="text-sm text-muted-foreground">
                          Notificações sobre agendamentos próximos
                        </p>
                      </div>
                      <Switch
                        checked={userData.notifications.reminders}
                        onCheckedChange={(checked) => 
                          setUserData({
                            ...userData, 
                            notifications: {...userData.notifications, reminders: checked}
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Promoções e Novidades</h4>
                        <p className="text-sm text-muted-foreground">
                          Ofertas especiais e novidades das barbearias
                        </p>
                      </div>
                      <Switch
                        checked={userData.notifications.marketing}
                        onCheckedChange={(checked) => 
                          setUserData({
                            ...userData, 
                            notifications: {...userData.notifications, marketing: checked}
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Alertas de Fidelidade</h4>
                        <p className="text-sm text-muted-foreground">
                          Notificações sobre pontos e recompensas do programa de fidelidade
                        </p>
                      </div>
                      <Switch
                        checked={userData.notifications.loyalty}
                        onCheckedChange={(checked) => 
                          setUserData({
                            ...userData, 
                            notifications: {...userData.notifications, loyalty: checked}
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={!isEditing}
                >
                  Redefinir para padrões
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair de Todos os Dispositivos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
};

export default ClientProfile;
