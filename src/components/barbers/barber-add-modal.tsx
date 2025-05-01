
import { useState } from "react";
import { z } from "zod";
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
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BarberAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Array of available services
const services = [
  { id: "corte_simples", label: "Corte Simples" },
  { id: "corte_degrade", label: "Corte Degradê" },
  { id: "barba", label: "Barba" },
  { id: "sobrancelha", label: "Sobrancelha" },
  { id: "combo", label: "Combo Corte + Barba" },
  { id: "pigmentacao", label: "Pigmentação" },
  { id: "tingimento", label: "Tingimento" },
  { id: "corte_infantil", label: "Corte Infantil" },
  { id: "tratamento", label: "Tratamento Capilar" },
];

// Form schema
const barberFormSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  services: z.array(z.string()).min(1, { message: "Selecione pelo menos um serviço" }),
  bio: z.string().optional(),
  systemAccess: z.boolean().default(false),
  workingDays: z.object({
    monday: z.boolean().default(true),
    tuesday: z.boolean().default(true),
    wednesday: z.boolean().default(true),
    thursday: z.boolean().default(true),
    friday: z.boolean().default(true),
    saturday: z.boolean().default(true),
    sunday: z.boolean().default(false),
  }),
});

type BarberFormValues = z.infer<typeof barberFormSchema>;

export function BarberAddModal({ isOpen, onClose }: BarberAddModalProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<BarberFormValues>({
    resolver: zodResolver(barberFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      services: [],
      bio: "",
      systemAccess: false,
      workingDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
      },
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function onSubmit(values: BarberFormValues) {
    // In a real app, this would call an API to save the barber
    console.log(values);
    toast({
      title: "Barbeiro adicionado",
      description: "O barbeiro foi cadastrado com sucesso!",
    });
    onClose();
  }

  const workingDays = [
    { id: "monday", label: "Segunda" },
    { id: "tuesday", label: "Terça" },
    { id: "wednesday", label: "Quarta" },
    { id: "thursday", label: "Quinta" },
    { id: "friday", label: "Sexta" },
    { id: "saturday", label: "Sábado" },
    { id: "sunday", label: "Domingo" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Barbeiro</DialogTitle>
          <DialogDescription>
            Preencha o formulário abaixo para cadastrar um novo barbeiro.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center justify-center mb-6">
              <Avatar className="w-24 h-24 border-4 border-muted">
                <AvatarImage src={avatarPreview || ""} />
                <AvatarFallback className="bg-barber-gold text-white text-3xl">
                  {form.getValues("name") 
                    ? form.getValues("name").substring(0, 2).toUpperCase()
                    : "B+"}
                </AvatarFallback>
              </Avatar>
              <div className="mt-2">
                <Input 
                  type="file" 
                  accept="image/*"
                  id="avatar-upload"
                  onChange={handleFileChange}
                  className="max-w-[250px]"
                />
                <FormDescription className="text-xs text-center mt-1">
                  Selecione uma foto do barbeiro
                </FormDescription>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do barbeiro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="systemAccess"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-end space-x-2 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Acesso ao Sistema</FormLabel>
                      <FormDescription>
                        Permite que o barbeiro acesse o sistema
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="services"
              render={() => (
                <FormItem>
                  <FormLabel>Serviços Oferecidos</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 rounded-md border p-4">
                    {services.map((service) => (
                      <FormField
                        key={service.id}
                        control={form.control}
                        name="services"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={service.id}
                              className="flex flex-row items-start space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(service.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, service.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== service.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {service.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workingDays"
              render={() => (
                <FormItem>
                  <FormLabel>Dias de Trabalho</FormLabel>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2 rounded-md border p-4">
                    {workingDays.map((day) => (
                      <FormField
                        key={day.id}
                        control={form.control}
                        name={`workingDays.${day.id as keyof BarberFormValues["workingDays"]}`}
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={day.id}
                              className="flex flex-col items-center space-y-2"
                            >
                              <FormLabel className="text-xs font-normal">
                                {day.label}
                              </FormLabel>
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-barber-gold 
                                  data-[state=checked]:border-barber-gold"
                                />
                              </FormControl>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormDescription className="text-xs mt-2">
                    Selecione os dias em que o barbeiro trabalha
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalhes sobre o barbeiro, experiência, especialidades, etc." 
                      className="resize-none" 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Informações adicionais que serão exibidas no perfil do barbeiro
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-barber-gold hover:bg-barber-gold/80"
              >
                Salvar Barbeiro
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
