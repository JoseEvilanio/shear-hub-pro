
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";

export function AppointmentAddModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-barber-gold hover:bg-barber-gold/80">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Crie um novo agendamento para um cliente
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <p className="text-center text-muted-foreground">
            Funcionalidade em desenvolvimento.
          </p>
        </div>
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            className="mr-2"
          >
            Cancelar
          </Button>
          <Button className="bg-barber-gold hover:bg-barber-gold/80">
            Agendar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
