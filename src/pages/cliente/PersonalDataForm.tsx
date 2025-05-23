import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import React from "react";

interface PersonalDataFormProps {
  userData: any;
  setUserData: (data: any) => void;
  isEditing: boolean;
}

export const PersonalDataForm: React.FC<PersonalDataFormProps> = ({ userData, setUserData, isEditing }) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Avatar className="w-24 h-24">
          <AvatarImage src={userData?.avatar || ""} />
          <AvatarFallback className="text-2xl bg-barber-gold">{userData?.name ? userData.name.substring(0,2).toUpperCase() : "US"}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h3 className="font-medium">Foto de Perfil</h3>
          <div className="text-sm text-muted-foreground">
            Sua foto será exibida em seu perfil e nos agendamentos.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!isEditing}>
              <Upload className="mr-2 h-4 w-4" />
              Carregar Foto
            </Button>
            <Button variant="outline" size="sm" disabled={!isEditing}>
              Remover
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={userData?.name || ""}
              onChange={(e) => setUserData({...userData, name: e.target.value})}
              disabled={!isEditing}
              required
              minLength={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={userData?.email || ""}
              onChange={(e) => setUserData({...userData, email: e.target.value})}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={userData.phone}
              onChange={(e) => setUserData({...userData, phone: e.target.value})}
              disabled={!isEditing}
              required
              pattern="\(\d{2}\) \d{4,5}-\d{4}"
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              value={userData.birthDate}
              onChange={(e) => setUserData({...userData, birthDate: e.target.value})}
              disabled={!isEditing}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Gênero</Label>
            <RadioGroup
              value={userData.gender}
              onValueChange={(value) => setUserData({...userData, gender: value})}
              disabled={!isEditing}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="masculino" id="masculino" />
                <Label htmlFor="masculino">Masculino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="feminino" id="feminino" />
                <Label htmlFor="feminino">Feminino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="outro" id="outro" />
                <Label htmlFor="outro">Outro</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={userData.bio}
              onChange={(e) => setUserData({...userData, bio: e.target.value})}
              disabled={!isEditing}
              placeholder="Conte um pouco sobre você..."
              className="resize-none"
              maxLength={300}
            />
          </div>
        </div>
      </div>
    </>
  );
};