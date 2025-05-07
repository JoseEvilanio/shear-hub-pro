
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

interface AppointmentAddModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppointmentAddModal({ isOpen, onClose }: AppointmentAddModalProps) {
  const [open, setOpen] = useState(false);
  
  // Handle controlled state from parent component if provided
  const isDialogOpen = isOpen !== undefined ? isOpen : open;
  
  // Handle close function
  const handleOpenChange = (newOpen: boolean) => {
    if (isOpen === undefined) {
      // Only update internal state if we're not controlled
      setOpen(newOpen);
    }
    // Call onClose when dialog is closed
    if (!newOpen && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      {!isOpen && (
        <DialogTrigger asChild>
          <Button className="bg-barber-gold hover:bg-barber-gold/80">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </DialogTrigger>
      )}
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
            onClick={() => handleOpenChange(false)} 
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
