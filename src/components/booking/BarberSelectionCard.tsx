
import { User } from "lucide-react";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { mockBarbers } from "@/data/mock-barbers";

interface BarberSelectionCardProps {
  form: any;
}

export function BarberSelectionCard({ form }: BarberSelectionCardProps) {
  return (
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
  );
}
