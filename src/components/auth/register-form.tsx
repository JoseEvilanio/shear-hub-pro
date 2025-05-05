
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Facebook, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const registerSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
});

export function RegisterForm() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("cliente");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    
    try {
      // Define o tipo de usuário baseado na seleção
      const role = userType === "cliente" ? "client" : "owner";
      const [firstName, ...lastNameParts] = values.name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      // Register the user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName || '',
            role: role, // Armazena a função do usuário nos metadados
          }
        }
      });

      if (error) {
        throw error;
      }

      toast.success("Conta criada com sucesso!");
      
      // Redirect to client area if client, login if barbershop
      if (userType === "cliente") {
        navigate("/cliente");
      } else {
        navigate("/login");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
      console.error("Erro de registro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    setIsLoading(true);
    
    // Simulando login social
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Conta criada com ${provider} com sucesso!`);
      navigate(userType === "proprietario" ? "/dashboard" : "/cliente");
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-card rounded-lg shadow-lg">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-barber-gold">Criar Conta</h1>
        <p className="text-muted-foreground">
          Preencha os dados abaixo para criar sua conta
        </p>
      </div>

      <Tabs defaultValue="cliente" onValueChange={setUserType} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="cliente">Sou Cliente</TabsTrigger>
          <TabsTrigger value="proprietario">Sou Proprietário</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cliente" className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-barber-gold hover:bg-barber-gold/80" disabled={isLoading}>
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>
          </Form>
          
          <div className="text-center text-sm mt-4">
            <p>
              Já tem uma conta?{" "}
              <Link to="/login" className="text-barber-gold hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="proprietario" className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Barbearia</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da sua barbearia" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="barbearia@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-barber-gold hover:bg-barber-gold/80" disabled={isLoading}>
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>
          </Form>
          
          <div className="text-center text-sm mt-4">
            <p>
              Já tem uma conta?{" "}
              <Link to="/login" className="text-barber-gold hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 bg-card text-muted-foreground">Ou cadastre-se com</span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => handleSocialRegister("Facebook")}
        disabled={isLoading}
      >
        <Facebook className="mr-2 h-4 w-4" />
        Facebook
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full mt-2"
        onClick={() => handleSocialRegister("Google")}
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
