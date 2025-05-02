
import { z } from "zod";

// Form schema
export const appointmentFormSchema = z.object({
  client: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  service: z.string().min(1, { message: "Selecione um serviço" }),
  barber: z.string().min(1, { message: "Selecione um barbeiro" }),
  date: z.date({
    required_error: "Selecione uma data",
  }),
  time: z.string().min(1, { message: "Selecione um horário" }),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
