import { useState } from "react";
import { ClientLayout } from "@/components/layout/client-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Calendar, Search, Filter, Check, X, Clock } from "lucide-react";
import { mockPayments } from "@/data/mock-payments";
import { format } from "date-fns";
import { PaymentAddModal } from "@/components/payments/payment-add-modal";

// Mock para cartões salvos
const mockSavedCards = [
  {
    id: 1,
    type: "visa",
    lastFour: "4242",
    expiryMonth: "03",
    expiryYear: "2027",
    name: "João Silva",
    isDefault: true
  },
  {
    id: 2,
    type: "mastercard",
    lastFour: "5555",
    expiryMonth: "08",
    expiryYear: "2026",
    name: "João Silva",
    isDefault: false
  }
];

const ClientPayments = () => {
  const [activeTab, setActiveTab] = useState("historico");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  
  // Filtra os pagamentos baseado nos critérios
  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch = 
      payment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toString().includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "paid" && payment.status === "paid") ||
      (statusFilter === "pending" && payment.status === "pending");
    
    return matchesSearch && matchesStatus;
  });
  
  // Função para formatar data
  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split("/");
    return format(new Date(`${year}-${month}-${day}`), "dd/MM/yyyy");
  };
  
  // Função para obter o status de pagamento com estilo
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500 hover:bg-green-600">Pago</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Pendente</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };
  
  // Função para obter o método de pagamento
  const getPaymentMethod = (method: string) => {
    switch (method) {
      case "credit":
        return "Cartão de Crédito";
      case "cash":
        return "Dinheiro";
      default:
        return "Outro";
    }
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie seus pagamentos
          </p>
        </div>

        <Tabs defaultValue="historico" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="historico">
              <Calendar className="mr-2 h-4 w-4" />
              Histórico de Pagamentos
            </TabsTrigger>
            <TabsTrigger value="metodos">
              <CreditCard className="mr-2 h-4 w-4" />
              Métodos de Pagamento
            </TabsTrigger>
          </TabsList>
          
          {/* Tab de Histórico de Pagamentos */}
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por serviço..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="paid">Pagos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* Lista de pagamentos */}
            <div className="space-y-4">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <div className="font-medium">{payment.service}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(payment.date)}
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <div className="text-sm text-muted-foreground">
                            {getPaymentMethod(payment.method)}
                          </div>
                          <div className="font-medium">
                            R$ {payment.amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          Recibo #{payment.id}
                        </div>
                        <div className="flex gap-2 items-center">
                          {getStatusBadge(payment.status)}
                          
                          {payment.status === "pending" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-barber-gold border-barber-gold hover:text-barber-gold/80 hover:border-barber-gold/80"
                            >
                              Pagar Agora
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Calendar className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">Nenhum pagamento encontrado</h3>
                      <p className="text-sm text-muted-foreground">
                        Não encontramos pagamentos que correspondam aos seus critérios de busca.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {/* Tab de Métodos de Pagamento */}
          <TabsContent value="metodos" className="space-y-4">
            {/* Cartões Salvos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cartões Salvos</CardTitle>
                <CardDescription>
                  Gerencie seus cartões salvos para pagamentos mais rápidos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockSavedCards.map((card) => (
                  <div 
                    key={card.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs uppercase font-bold">
                        {card.type}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          •••• {card.lastFour}
                          {card.isDefault && (
                            <Badge variant="outline" className="text-xs font-normal">Padrão</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {card.name} • Expira em {card.expiryMonth}/{card.expiryYear}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3 sm:mt-0">
                      {!card.isDefault && (
                        <Button variant="outline" size="sm">
                          Definir como padrão
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-2" onClick={() => setShowAddCardModal(true)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Adicionar novo cartão
                </Button>
                {showAddCardModal && (
                  <PaymentAddModal open={showAddCardModal} onClose={() => setShowAddCardModal(false)} />
                )}
              </CardContent>
            </Card>
            
            {/* Outros métodos de pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Outros Métodos</CardTitle>
                <CardDescription>
                  Outros métodos de pagamento disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs uppercase font-bold">
                      PIX
                    </div>
                    <div>
                      <div className="font-medium">Pagamento com PIX</div>
                      <div className="text-sm text-muted-foreground">
                        Pagamento instantâneo via QR Code
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-green-500 border-green-500">Habilitado</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs uppercase font-bold">
                      Dinheiro
                    </div>
                    <div>
                      <div className="font-medium">Pagamento em Dinheiro</div>
                      <div className="text-sm text-muted-foreground">
                        Pague diretamente na barbearia
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-green-500 border-green-500">Habilitado</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
};

export default ClientPayments;
