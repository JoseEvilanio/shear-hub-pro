
import { useState } from "react";
import { ClientLayout } from "@/components/layout/client-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Star, Gift, Calendar, Trophy, Scissors, Check, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

// Mock para programa de fidelidade
const mockLoyaltyData = {
  points: 7,
  visitsRequired: 10,
  visitsHistory: [
    { id: 1, date: "2025-04-28", barberShop: "Barbearia Vintage", service: "Corte + Barba" },
    { id: 2, date: "2025-04-15", barberShop: "Barbearia Vintage", service: "Degradê" },
    { id: 3, date: "2025-03-30", barberShop: "Barbearia Vintage", service: "Corte Simples" },
    { id: 4, date: "2025-03-15", barberShop: "Barbearia Vintage", service: "Corte + Barba" },
    { id: 5, date: "2025-03-01", barberShop: "Barbearia Vintage", service: "Barba" },
    { id: 6, date: "2025-02-15", barberShop: "Corte & Estilo", service: "Degradê" },
    { id: 7, date: "2025-02-01", barberShop: "Barbearia Vintage", service: "Corte + Barba" },
  ],
  rewards: [
    { id: 1, name: "Corte Grátis", description: "Um corte de cabelo grátis", status: "available", expiry: "2025-06-30" },
    { id: 2, name: "Hidratação", description: "Hidratação capilar gratuita", status: "used", usedDate: "2025-03-10" },
    { id: 3, name: "Desconto 20%", description: "20% de desconto em qualquer serviço", status: "expired", expiry: "2025-01-15" },
  ]
};

// Mock para programa de indicações
const mockReferralsData = {
  totalReferrals: 3,
  referralsRequired: 5,
  referralHistory: [
    { id: 1, name: "Ana Silva", date: "2025-04-20", status: "completed" },
    { id: 2, name: "Bruno Santos", date: "2025-03-15", status: "completed" },
    { id: 3, name: "Carlos Oliveira", date: "2025-02-10", status: "completed" },
  ],
  referralCode: "JOAO2025"
};

const ClientLoyalty = () => {
  const [activeTab, setActiveTab] = useState("fidelidade");
  
  // Calcular progresso
  const loyaltyProgress = (mockLoyaltyData.points / mockLoyaltyData.visitsRequired) * 100;
  const referralsProgress = (mockReferralsData.totalReferrals / mockReferralsData.referralsRequired) * 100;
  
  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM, yyyy", { locale: pt });
  };
  
  // Funções para resgate de recompensa
  const handleRedeemReward = () => {
    toast.success("Recompensa resgatada com sucesso!", {
      description: "Você pode usar seu corte grátis em qualquer unidade nos próximos 30 dias."
    });
  };
  
  // Função para copiar código de indicação
  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(mockReferralsData.referralCode);
    toast.success("Código copiado para a área de transferência!");
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fidelidade</h1>
          <p className="text-muted-foreground">
            Acompanhe seus pontos e recompensas
          </p>
        </div>

        {/* Tabs para alternar entre fidelidade e indicações */}
        <Tabs defaultValue="fidelidade" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="fidelidade">
              <Star className="mr-2 h-4 w-4" />
              Programa de Fidelidade
            </TabsTrigger>
            <TabsTrigger value="indicacoes">
              <Gift className="mr-2 h-4 w-4" />
              Programa de Indicações
            </TabsTrigger>
          </TabsList>
          
          {/* Conteúdo da aba de fidelidade */}
          <TabsContent value="fidelidade" className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-barber-gold/80 to-yellow-500/80">
                <CardTitle className="text-white">Programa de Fidelidade</CardTitle>
                <CardDescription className="text-white/90">
                  A cada 10 cortes, você ganha 1 grátis
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Indicador visual de progresso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso para próxima recompensa</span>
                      <span className="font-medium">{mockLoyaltyData.points}/{mockLoyaltyData.visitsRequired}</span>
                    </div>
                    <Progress 
                      value={loyaltyProgress} 
                      className="h-2" 
                      style={{ 
                        '--progress-background': 'hsl(var(--barber-gold))'
                      } as React.CSSProperties} 
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Faltam {mockLoyaltyData.visitsRequired - mockLoyaltyData.points} cortes para você ganhar um grátis!
                    </p>
                  </div>
                  
                  {/* Visualização de selos */}
                  <div className="grid grid-cols-5 gap-2 md:gap-4">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "aspect-square rounded-full flex items-center justify-center border-2",
                          index < mockLoyaltyData.points
                            ? "bg-barber-gold/10 border-barber-gold text-barber-gold"
                            : "bg-muted/30 border-muted text-muted-foreground"
                        )}
                      >
                        {index < mockLoyaltyData.points ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Scissors className="h-4 w-4 opacity-70" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Recompensas disponíveis */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recompensas Disponíveis</h3>
                    <div className="space-y-3">
                      {mockLoyaltyData.rewards.filter(r => r.status === "available").map((reward) => (
                        <Card key={reward.id}>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-barber-gold/10 flex items-center justify-center">
                                <Gift className="h-5 w-5 text-barber-gold" />
                              </div>
                              <div>
                                <h4 className="font-medium">{reward.name}</h4>
                                <p className="text-sm text-muted-foreground">{reward.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  Expira em {formatDate(reward.expiry)}
                                </p>
                              </div>
                            </div>
                            <Button 
                              className="bg-barber-gold hover:bg-barber-gold/90"
                              onClick={handleRedeemReward}
                            >
                              Resgatar
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {mockLoyaltyData.rewards.filter(r => r.status === "available").length === 0 && (
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-muted-foreground">
                            Você não possui recompensas disponíveis no momento.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Histórico de visitas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Visitas</CardTitle>
                <CardDescription>
                  Suas últimas visitas registradas no programa de fidelidade
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {mockLoyaltyData.visitsHistory.map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Scissors className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{visit.service}</div>
                          <div className="text-sm text-muted-foreground">{visit.barberShop}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(visit.date)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Conteúdo da aba de indicações */}
          <TabsContent value="indicacoes" className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500/80 to-indigo-500/80">
                <CardTitle className="text-white">Programa de Indicações</CardTitle>
                <CardDescription className="text-white/90">
                  Indique amigos e ganhe recompensas
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Progresso de indicações */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Indicações confirmadas</span>
                      <span className="font-medium">{mockReferralsData.totalReferrals}/{mockReferralsData.referralsRequired}</span>
                    </div>
                    <Progress 
                      value={referralsProgress} 
                      className="h-2" 
                      style={{ 
                        '--progress-background': 'hsl(var(--purple-500))'
                      } as React.CSSProperties} 
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Faltam {mockReferralsData.referralsRequired - mockReferralsData.totalReferrals} indicações para você ganhar um corte grátis!
                    </p>
                  </div>
                  
                  {/* Código de indicação */}
                  <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                    <h4 className="text-sm font-medium">Seu código de indicação</h4>
                    <div className="flex items-center gap-2">
                      <div className="bg-background p-3 rounded border flex-1 text-center font-mono font-medium">
                        {mockReferralsData.referralCode}
                      </div>
                      <Button variant="outline" onClick={handleCopyReferralCode}>
                        Copiar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Compartilhe este código com seus amigos. Quando eles se cadastrarem usando seu código e fizerem um agendamento, você ganhará pontos.
                    </p>
                  </div>
                  
                  {/* Compartilhar convite */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <i className="fab fa-whatsapp mr-2"></i>
                      WhatsApp
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <i className="far fa-envelope mr-2"></i>
                      Email
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <i className="fas fa-link mr-2"></i>
                      Copiar Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Histórico de indicações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Indicações</CardTitle>
                <CardDescription>
                  Amigos que você indicou para nosso aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {mockReferralsData.referralHistory.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{referral.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {referral.status === "completed" ? "Indicação confirmada" : "Aguardando primeiro agendamento"}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(referral.date)}
                      </div>
                    </div>
                  ))}
                  
                  {mockReferralsData.referralHistory.length === 0 && (
                    <div className="text-center p-6">
                      <p className="text-muted-foreground">
                        Você ainda não tem indicações registradas.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
};

export default ClientLoyalty;
