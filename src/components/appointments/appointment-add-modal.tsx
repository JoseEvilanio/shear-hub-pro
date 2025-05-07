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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface AppointmentAddModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AppointmentAddModal({ isOpen, onClose }: AppointmentAddModalProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [clientName, setClientName] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  
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

  // Mock available times
  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
    "16:00", "16:30", "17:00", "17:30"
  ];

  // Mock services
  const services = [
    { id: "1", name: "Corte de Cabelo", price: 40 },
    { id: "2", name: "Barba", price: 30 },
    { id: "3", name: "Combo (Corte + Barba)", price: 60 },
    { id: "4", name: "Corte Degradê", price: 45 }
  ];

  // Mock barbers
  const barbers = [
    { id: "1", name: "Carlos" },
    { id: "2", name: "Eduardo" },
    { id: "3", name: "André" }
  ];

  const handleSubmit = () => {
    // Validação básica
    if (!clientName || !selectedService || !selectedBarber || !date || !selectedTime) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Simulação de criação de agendamento
    toast.success("Agendamento criado com sucesso!", {
      description: `${clientName} agendado para ${format(date, "dd/MM/yyyy")} às ${selectedTime}`
    });

    // Limpar formulário e fechar modal
    resetForm();
    handleOpenChange(false);
  };

  const resetForm = () => {
    setClientName("");
    setSelectedService("");
    setSelectedBarber("");
    setDate(new Date());
    setSelectedTime("");
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Crie um novo agendamento para um cliente
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Cliente */}
          <div className="grid gap-2">
            <Label htmlFor="clientName">Nome do Cliente</Label>
            <Input 
              id="clientName" 
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Digite o nome do cliente" 
            />
          </div>

          {/* Serviço */}
          <div className="grid gap-2">
            <Label htmlFor="service">Serviço</Label>
            <Select 
              value={selectedService} 
              onValueChange={setSelectedService}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - R$ {service.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Barbeiro */}
          <div className="grid gap-2">
            <Label htmlFor="barber">Barbeiro</Label>
            <Select 
              value={selectedBarber} 
              onValueChange={setSelectedBarber}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o barbeiro" />
              </SelectTrigger>
              <SelectContent>
                {barbers.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data */}
          <div className="grid gap-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Horário */}
          <div className="grid gap-2">
            <Label htmlFor="time">Horário</Label>
            <Select 
              value={selectedTime} 
              onValueChange={setSelectedTime}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {availableTimes.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              resetForm();
              handleOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button 
            className="bg-barber-gold hover:bg-barber-gold/80"
            onClick={handleSubmit}
          >
            Agendar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
