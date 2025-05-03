
import * as z from "zod";

// Schema de validação para o formulário de agendamento
export const bookingFormSchema = z.object({
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

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
