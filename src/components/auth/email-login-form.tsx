
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailLoginFormProps {
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  userType: string;
}

export const EmailLoginForm: React.FC<EmailLoginFormProps> = ({
  onSubmit,
  isLoading,
  userType
}) => {
  const idPrefix = userType === "cliente" ? "cliente" : "prop";
  
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-email`}>Email</Label>
          <Input 
            id={`${idPrefix}-email`} 
            name="email" 
            placeholder={userType === "cliente" ? "seu@email.com" : "empresa@email.com"} 
            type="email" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-password`}>Senha</Label>
          <Input id={`${idPrefix}-password`} name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full bg-barber-gold hover:bg-barber-gold/80" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      
      <div className="flex items-center justify-between mt-4 text-sm">
        <Link to="/forgot-password">
          <Button variant="link" size="sm">
            Esqueci minha senha
          </Button>
        </Link>
        <Link to="/register">
          <Button variant="link" size="sm">
            Criar conta
          </Button>
        </Link>
      </div>
    </>
  );
};
