import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ClientLayout } from "@/components/layout/client-layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  CreditCard, 
  Scissors, 
  Clock, 
  User, 
  CheckCircle2, 
  QrCode,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { mockBarbers } from "@/data/mock-barbers";
import { mockServices } from "@/data/mock-services";

// Schema de validação para o formulário de agendamento
const bookingFormSchema = z.object({
  service: z.string({
    required_error: "Por favor, selecione um serviço.",
  }),
  barber: z.string().optional(),
  date: z.date({
    required_error: "Por favor, selecione uma data.",
  }),
  time: z.string({
    required_error: "Por favor, selecione um horário.",
  }),
  paymentMethod: z.enum(["na_hora", "pix", "cartao", "carteira"], {
    required_error: "Por favor, selecione um método de pagamento.",
  }),
});

// Mock para barbearia
const mockBarberShop = {
  id: 1,
  name: "Barbearia Vintage",
  address: "Rua Augusta, 1200, São Paulo"
};

const ClientBookingForm = () => {
  const { barberShopId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preSelectedTime = searchParams.get("time");
  
  // Estados para o formulário
  const [date, setDate] = useState<Date>(new Date());
  const [availableTimes, setAvailableTimes] = useState([
    "09:00", "09:30", "10:00", "10:30", 
    "11:00", "11:30", "13:00", "13:30", 
    "14:00", "14:30", "15:00", "15:30", 
    "16:00", "16:30", "17:00", "17:30"
  ]);
  const [bookedTimes] = useState(["10:30", "14:00", "16:30"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Setup do formulário react-hook-form
  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      service: "",
      barber: undefined,
      date: date,
      time: preSelectedTime || "",
      paymentMethod: "na_hora",
    },
  });

  // Em uma aplicação real, carregaríamos os dados da barbearia pelo ID da URL
  
  // Função para controlar a submissão do formulário
  const onSubmit = (values: z.infer<typeof bookingFormSchema>) => {
    setIsSubmitting(true);
    
    // Simulação de envio para API
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Exibir toaster de confirmação
      toast.success("Agendamento confirmado!", {
        description: `Seu agendamento foi marcado para ${format(values.date, "dd 'de' MMMM", { locale: pt })} às ${values.time}.`,
        action: {
          label: "Ver detalhes",
          onClick: () => navigate("/cliente/agendamentos"),
        },
      });
      
      // Redirecionar para a página de agendamentos
      navigate("/cliente/agendamentos");
    }, 1500);
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendar Horário</h1>
          <p className="text-muted-foreground">
            Escolha os serviços e horário na {mockBarberShop.name}
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Seleção de serviço */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scissors className="h-5 w-5" />
                      Selecione o Serviço
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mockServices.map((service) => (
                              <div
                                key={service.id}
                                className={cn(
                                  "flex flex-col p-4 cursor-pointer border rounded-lg transition-colors",
                                  field.value === String(service.id)
                                    ? "border-barber-gold bg-barber-gold/5"
                                    : "hover:bg-muted/50"
                                )}
                                onClick={() => field.onChange(String(service.id))}
                              >
                                <div className="flex justify-between">
                                  <h3 className="font-medium">{service.name}</h3>
                                  {field.value === String(service.id) && (
                                    <CheckCircle2 className="h-5 w-5 text-barber-gold" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground my-1">
                                  {service.description}
                                </p>
                                <div className="flex justify-between mt-2">
                                  <span className="text-sm text-muted-foreground">
                                    {service.duration} min
                                  </span>
                                  <span className="font-medium">
                                    R$ {service.price.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Seleção de barbeiro */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Escolha o Profissional (Opcional)
                    </CardTitle>
                    <CardDescription>
                      Deixe em branco para o primeiro disponível
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="barber"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {mockBarbers
                              .filter(barber => barber.status === "active")
                              .map(barber => (
                                <div
                                  key={barber.id}
                                  className={cn(
                                    "flex flex-col items-center p-3 cursor-pointer border rounded-lg transition-colors",
                                    field.value === String(barber.id)
                                      ? "border-barber-gold bg-barber-gold/5"
                                      : "hover:bg-muted/50"
                                  )}
                                  onClick={() => field.onChange(String(barber.id))}
                                >
                                  <Avatar className="h-16 w-16 mb-2">
                                    <AvatarImage src={barber.avatar} alt={barber.name} />
                                    <AvatarFallback className="bg-barber-gold text-background">
                                      {barber.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="text-center">
                                    <div className="font-medium">{barber.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {barber.specialties.join(", ")}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Seleção de data e hora */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Data e Horário
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Calendário para seleção de data */}
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full md:w-[240px] pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd 'de' MMMM, yyyy", { locale: pt })
                                    ) : (
                                      "Selecione uma data"
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    setDate(date || new Date());
                                  }}
                                  disabled={(date) =>
                                    date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                    date > new Date(new Date().setMonth(new Date().getMonth() + 1))
                                  }
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Horários disponíveis */}
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {availableTimes.map((time) => {
                                const isBooked = bookedTimes.includes(time);
                                return (
                                  <Button
                                    key={time}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      field.value === time 
                                        ? "bg-barber-gold text-white hover:bg-barber-gold/90" 
                                        : "",
                                      isBooked 
                                        ? "opacity-50 cursor-not-allowed" 
                                        : ""
                                    )}
                                    onClick={() => {
                                      if (!isBooked) {
                                        field.onChange(time);
                                      }
                                    }}
                                    disabled={isBooked}
                                  >
                                    {time}
                                  </Button>
                                );
                              })}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Opções de pagamento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Forma de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                              <RadioGroupItem value="na_hora" id="na_hora" />
                              <Label htmlFor="na_hora" className="flex flex-1 items-center">
                                <Scissors className="mr-2 h-5 w-5 text-muted-foreground" />
                                <div>
                                  <div>Pagar na hora</div>
                                  <div className="text-sm text-muted-foreground">
                                    Efetue o pagamento diretamente na barbearia
                                  </div>
                                </div>
                              </Label>
                            </div>
                            
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                              <RadioGroupItem value="pix" id="pix" />
                              <Label htmlFor="pix" className="flex flex-1 items-center">
                                <QrCode className="mr-2 h-5 w-5 text-muted-foreground" />
                                <div>
                                  <div>Pagar com PIX</div>
                                  <div className="text-sm text-muted-foreground">
                                    Pagamento instantâneo via QR Code
                                  </div>
                                </div>
                              </Label>
                            </div>
                            
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                              <RadioGroupItem value="cartao" id="cartao" />
                              <Label htmlFor="cartao" className="flex flex-1 items-center">
                                <CreditCard className="mr-2 h-5 w-5 text-muted-foreground" />
                                <div>
                                  <div>Cartão de Crédito</div>
                                  <div className="text-sm text-muted-foreground">
                                    Pagamento seguro com cartão
                                  </div>
                                </div>
                              </Label>
                            </div>
                            
                            <div className="flex items-center space-x-2 rounded-md border p-3 opacity-50 cursor-not-allowed">
                              <RadioGroupItem value="carteira" id="carteira" disabled />
                              <Label htmlFor="carteira" className="flex flex-1 items-center">
                                <Wallet className="mr-2 h-5 w-5 text-muted-foreground" />
                                <div>
                                  <div>Saldo na Carteira</div>
                                  <div className="text-sm text-muted-foreground">
                                    Você não possui saldo (Em breve)
                                  </div>
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => navigate(`/cliente/barbearia/${barberShopId}`)}
                    >
                      Voltar
                    </Button>
                    
                    <Button 
                      type="submit" 
                      className="bg-barber-gold hover:bg-barber-gold/90" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Confirmando..." : "Confirmar Agendamento"}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </div>
          
          {/* Resumo do agendamento */}
          <div className="lg:w-1/3">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumo do Agendamento</CardTitle>
                <CardDescription>
                  Confira os detalhes antes de confirmar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Barbearia */}
                <div>
                  <h3 className="text-sm font-medium mb-1">Barbearia</h3>
                  <div className="flex items-start gap-2">
                    <Scissors className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{mockBarberShop.name}</div>
                      <div className="text-xs text-muted-foreground">{mockBarberShop.address}</div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Serviço */}
                <div>
                  <h3 className="text-sm font-medium mb-1">Serviço Selecionado</h3>
                  {form.watch("service") ? (
                    <div className="flex justify-between items-center">
                      <div>
                        {mockServices.find(s => String(s.id) === form.watch("service"))?.name || "Nenhum serviço selecionado"}
                      </div>
                      <div className="font-medium">
                        R$ {mockServices.find(s => String(s.id) === form.watch("service"))?.price.toFixed(2) || "0.00"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Selecione um serviço</div>
                  )}
                </div>
                
                <Separator />
                
                {/* Barbeiro */}
                <div>
                  <h3 className="text-sm font-medium mb-1">Profissional</h3>
                  {form.watch("barber") ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-barber-gold text-background text-xs">
                          {mockBarbers.find(b => String(b.id) === form.watch("barber"))?.name.substring(0, 2).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {mockBarbers.find(b => String(b.id) === form.watch("barber"))?.name || "Qualquer disponível"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Primeiro profissional disponível</div>
                  )}
                </div>
                
                <Separator />
                
                {/* Data e Hora */}
                <div>
                  <h3 className="text-sm font-medium mb-1">Data e Hora</h3>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {form.watch("date") 
                          ? format(form.watch("date"), "dd/MM/yyyy", { locale: pt })
                          : "Selecione uma data"
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{form.watch("time") || "Selecione um horário"}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Forma de Pagamento */}
                <div>
                  <h3 className="text-sm font-medium mb-1">Pagamento</h3>
                  <div>
                    {form.watch("paymentMethod") === "na_hora" && "Pagamento na barbearia"}
                    {form.watch("paymentMethod") === "pix" && "PIX"}
                    {form.watch("paymentMethod") === "cartao" && "Cartão de Crédito"}
                    {form.watch("paymentMethod") === "carteira" && "Saldo na Carteira"}
                  </div>
                </div>
                
                <Separator />
                
                {/* Total */}
                <div>
                  <div className="flex justify-between items-center text-lg font-medium">
                    <span>Total</span>
                    <span>
                      R$ {form.watch("service") 
                        ? mockServices.find(s => String(s.id) === form.watch("service"))?.price.toFixed(2) 
                        : "0.00"
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

// Componente auxiliar para Label
const Label = ({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
    >
      {children}
    </label>
  );
};

export default ClientBookingForm;
