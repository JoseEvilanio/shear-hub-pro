import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import React from "react";

interface PaymentMethodSelectorProps {
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ value, onChange, isEditing }) => {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      disabled={!isEditing}
      required
      aria-label="Método de Pagamento Preferido"
    >
      <div className="flex items-center space-x-2 rounded-md border p-3 mb-3">
        <RadioGroupItem value="credit" id="credit" />
        <Label htmlFor="credit">Cartão de Crédito</Label>
      </div>
      <div className="flex items-center space-x-2 rounded-md border p-3 mb-3">
        <RadioGroupItem value="pix" id="pix" />
        <Label htmlFor="pix">PIX</Label>
      </div>
      <div className="flex items-center space-x-2 rounded-md border p-3">
        <RadioGroupItem value="cash" id="cash" />
        <Label htmlFor="cash">Dinheiro</Label>
      </div>
    </RadioGroup>
  );
};