
import { useState } from "react";
import { CheckCircle2, Scissors } from "lucide-react";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { mockServices } from "@/data/mock-services";

interface ServiceSelectionCardProps {
  form: any;
}

export function ServiceSelectionCard({ form }: ServiceSelectionCardProps) {
  return (
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
  );
}
