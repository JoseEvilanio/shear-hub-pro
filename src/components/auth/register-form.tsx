import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Facebook } from "lucide-react";
import { FcGoogle } from 'react-icons/fc';
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const registerSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Deve conter uma letra maiúscula")
    .regex(/[a-z]/, "Deve conter uma letra minúscula")
    .regex(/[0-9]/, "Deve conter um número")
    .regex(/[\W_]/, "Deve conter um caractere especial"),
  password_confirmation: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "Você precisa aceitar os termos de uso"
  })
}).refine((data) => data.password === data.password_confirmation, {
  path: ["password_confirmation"],
  message: "Confirmação de senha não confere"
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
      password_confirmation: "",
      terms: false
    },
  });

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const role = userType === "cliente" ? "client" : "owner";
      
      console.log('Iniciando registro com:', {
        email: values.email,
        role
      });

      // Prepara os dados do nome
      const fullName = values.name;
      const first_name = userType === "cliente" ? fullName.split(' ')[0] : fullName;
      const last_name = userType === "cliente" ? fullName.split(' ').slice(1).join(' ') : '';

      // Registra o usuário no Supabase Auth com metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { 
            role,
            first_name,
            last_name
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        console.error('Erro no registro:', authError);
        throw authError;
      }

      if (!authData?.user) {
        // Isso acontece quando o usuário precisa confirmar o e-mail
        toast.success("Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.");
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate("/login");
        return;
      }

      const userId = authData.user.id;
      console.log('Usuário criado:', userId);

      if (role === 'owner') {
        console.log('Criando barbearia para o proprietário:', userId);
        
        // Aguarda um momento para garantir que os metadados foram processados
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { error: barbershopError } = await supabase
          .from('barbershops')
          .insert({
            name: values.name,
            owner_id: userId,
            status: 'pending',
            address: '',
            city: ''
          });

        if (barbershopError) {
          console.error('Erro ao criar barbearia:', barbershopError);
          throw new Error(`Erro ao criar registro da barbearia: ${barbershopError.message}`);
        }

        console.log('Barbearia criada com sucesso');
      }

      toast.success("Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.");
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate("/login");

    } catch (error: any) {
      console.error("Erro detalhado:", error);
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = async (provider: 'google' | 'facebook') => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const role = userType === "cliente" ? "client" : "owner";

      localStorage.setItem('intendedRole', role);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            role: role
          }
        },
      });

      if (error) {
        toast.error(`Erro ao registrar com ${provider}: ${error.message}`);
        console.error(`Error during ${provider} OAuth sign-in:`, error);
        setIsLoading(false);
      }
    } catch (error: any) {
      toast.error(`Um erro inesperado ocorreu: ${error.message}`);
      console.error("Unexpected error during social registration:", error);
      setIsLoading(false);
    }
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
              <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Eu concordo com os{" "}
                        <Link to="/termos" className="text-barber-gold hover:underline">
                          Termos de uso
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
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
              <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Eu concordo com os{" "}
                        <Link to="/termos" className="text-barber-gold hover:underline">
                          Termos de uso
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
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
        onClick={() => handleSocialRegister("facebook")}
        disabled={isLoading}
      >
        <Facebook className="mr-2 h-4 w-4" />
        Facebook
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full mt-2"
        onClick={() => handleSocialRegister("google")}
        disabled={isLoading}
      >
        <FcGoogle className="mr-2 h-4 w-4" />
        Google
      </Button>
    </div>
  );
}
