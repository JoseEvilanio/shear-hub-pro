
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { appointmentFormSchema, AppointmentFormValues } from "./appointment-form-schema";
import { ClientInfoFields } from "./client-info-fields";
import { ServiceBarberFields } from "./service-barber-fields";
import { DateTimeFields } from "./date-time-fields";

interface AppointmentAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentAddModal({ isOpen, onClose }: AppointmentAddModalProps) {
  const { toast } = useToast();
  
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      client: "",
      phone: "",
      service: "",
      barber: "",
      time: "",
    },
  });

  function onSubmit(values: AppointmentFormValues) {
    // Em uma aplicação real, isso chamaria uma API para salvar o agendamento
    console.log(values);
    toast({
      title: "Agendamento criado",
      description: `Agendamento para ${values.client} criado com sucesso!`,
    });
    onClose();
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha o formulário para agendar um novo cliente.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <ClientInfoFields form={form} />
            <ServiceBarberFields form={form} />
            <DateTimeFields form={form} />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-barber-gold hover:bg-barber-gold/80"
              >
                Agendar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
