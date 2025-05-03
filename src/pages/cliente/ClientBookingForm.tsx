
import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ClientLayout } from "@/components/layout/client-layout";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Import refactored components
import { ServiceSelectionCard } from "@/components/booking/ServiceSelectionCard";
import { BarberSelectionCard } from "@/components/booking/BarberSelectionCard";
import { DateTimeSelectionCard } from "@/components/booking/DateTimeSelectionCard";
import { PaymentMethodCard } from "@/components/booking/PaymentMethodCard";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { bookingFormSchema, type BookingFormValues } from "@/components/booking/booking-form-schema";

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
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      service: "",
      barber: undefined,
      date: date,
      time: preSelectedTime || "",
      paymentMethod: "na_hora",
    },
  });

  // Função para controlar a submissão do formulário
  const onSubmit = (values: BookingFormValues) => {
    setIsSubmitting(true);
    
    // Simulação de envio para API
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Exibir toaster de confirmação
      toast.success("Agendamento confirmado!", {
        description: `Seu agendamento foi marcado para ${values.date.toLocaleDateString('pt-BR')} às ${values.time}.`,
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
                <ServiceSelectionCard form={form} />

                {/* Seleção de barbeiro */}
                <BarberSelectionCard form={form} />

                {/* Seleção de data e hora */}
                <DateTimeSelectionCard 
                  form={form} 
                  availableTimes={availableTimes} 
                  bookedTimes={bookedTimes} 
                />

                {/* Opções de pagamento */}
                <PaymentMethodCard 
                  form={form} 
                  barberShopId={barberShopId} 
                  isSubmitting={isSubmitting} 
                />
              </form>
            </Form>
          </div>
          
          {/* Resumo do agendamento */}
          <div className="lg:w-1/3">
            <BookingSummary form={form} barberShop={mockBarberShop} />
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientBookingForm;
