import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import React from "react";

interface AddressFormProps {
  userData: any;
  setUserData: (data: any) => void;
  isEditing: boolean;
  onUseCurrentLocation: () => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({ userData, setUserData, isEditing, onUseCurrentLocation }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Endereço Completo</Label>
          <Input
            id="address"
            value={userData.address}
            onChange={(e) => setUserData({...userData, address: e.target.value})}
            disabled={!isEditing}
            placeholder="Rua, número, complemento"
            required
            minLength={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={userData.city}
            onChange={(e) => setUserData({...userData, city: e.target.value})}
            disabled={!isEditing}
            required
            minLength={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            value={userData.state}
            onChange={(e) => setUserData({...userData, state: e.target.value})}
            disabled={!isEditing}
            required
            minLength={2}
          />
        </div>
      </div>
      {isEditing && (
        <Button variant="outline" className="mt-2" type="button" onClick={onUseCurrentLocation}>
          <MapPin className="mr-2 h-4 w-4" />
          Usar localização atual
        </Button>
      )}
    </div>
  );
};