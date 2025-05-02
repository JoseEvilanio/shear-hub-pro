
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Facebook } from "lucide-react";

export function LoginForm() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("cliente");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulando login
    setTimeout(() => {
      setIsLoading(false);
      if (userType === "proprietario") {
        navigate("/dashboard");
        toast.success("Login realizado com sucesso!");
      } else {
        navigate("/cliente");
        toast.success("Login realizado com sucesso!");
      }
    }, 1500);
  };
  
  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    
    // Simulando login social
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Login com ${provider} realizado com sucesso!`);
      navigate(userType === "proprietario" ? "/dashboard" : "/cliente");
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-card rounded-lg shadow-lg animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-barber-gold">ShearHub</h1>
        <p className="text-muted-foreground">
          Plataforma completa para gerenciamento de barbearias
        </p>
      </div>

      <Tabs defaultValue="cliente" onValueChange={setUserType} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="cliente">Sou Cliente</TabsTrigger>
          <TabsTrigger value="proprietario">Sou Proprietário</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cliente" className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cliente-email">Email</Label>
              <Input id="cliente-email" placeholder="seu@email.com" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente-password">Senha</Label>
              <Input id="cliente-password" type="password" required />
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
        </TabsContent>
        
        <TabsContent value="proprietario" className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prop-email">Email</Label>
              <Input id="prop-email" placeholder="empresa@email.com" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prop-password">Senha</Label>
              <Input id="prop-password" type="password" required />
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
        </TabsContent>
      </Tabs>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 bg-card text-muted-foreground">Ou entre com</span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => handleSocialLogin("Facebook")}
        disabled={isLoading}
      >
        <Facebook className="mr-2 h-4 w-4" />
        Facebook
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full mt-2"
        onClick={() => handleSocialLogin("Google")}
        disabled={isLoading}
      >
        <svg
          className="mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="12" y1="2" x2="12" y2="22" />
        </svg>
        Google
      </Button>
    </div>
  );
}
