
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Facebook } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function LoginForm() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("cliente");
  const [isLoading, setIsLoading] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [showAdminAccess, setShowAdminAccess] = useState(false);

  // Add this function to determine where to redirect the user based on their role
  const redirectBasedOnRole = async (userId: string, navigate: (path: string) => void) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (profile) {
        switch (profile.role) {
          case 'superuser':
          case 'admin':
            navigate('/admin');
            break;
          case 'owner':
            navigate('/dashboard');
            break;
          case 'client':
            navigate('/cliente');
            break;
          default:
            navigate('/cliente');
        }
      } else {
        navigate('/cliente'); // Default fallback
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      navigate('/cliente'); // Default fallback on error
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      
      if (!email || !password) {
        toast.error("Por favor, preencha todos os campos");
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }
      
      if (data.user) {
        toast.success("Login realizado com sucesso!");
        // Redirect based on user role
        await redirectBasedOnRole(data.user.id, navigate);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuperUser = async () => {
    setIsLoading(true);
    try {
      // Primeiro, vamos criar um usuário com dados básicos
      const email = "admin@shearhub.com";
      const password = "Admin123!";
      
      // Criar usuário com role de admin
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: "Admin",
            last_name: "Sistema",
            role: 'admin'
          }
        }
      });
      
      if (signUpError) {
        throw new Error('Erro ao criar usuário: ' + signUpError.message);
      }
      
      if (!authData.user) {
        throw new Error('Falha ao criar usuário');
      }
      
      // Esperar um momento para o trigger criar o perfil
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Promover para superuser usando a edge function
      const { data, error: promotionError } = await supabase.functions.invoke('promote-superuser', {
        body: { 
          user_id: authData.user.id,
          admin_key: adminKey
        }
      });

      if (promotionError) {
        throw new Error('Erro ao promover usuário: ' + promotionError.message);
      }
      
      toast.success(`Superusuário criado com sucesso! Email: ${email}, Senha: ${password}`);
      
      // Fazer login automático com o superuser criado
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (loginError) {
        throw loginError;
      }
      
      navigate('/admin');
      
    } catch (error: any) {
      console.error('Error creating superuser:', error);
      toast.error(error.message || 'Ocorreu um erro ao criar o superusuário');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialLogin = async (provider: 'facebook' | 'google') => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        toast.error(`Erro ao fazer login com ${provider}`);
        console.error(error);
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`Erro ao fazer login com ${provider}`);
    } finally {
      setIsLoading(false);
    }
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
              <Input id="cliente-email" name="email" placeholder="seu@email.com" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente-password">Senha</Label>
              <Input id="cliente-password" name="password" type="password" required />
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
              <Input id="prop-email" name="email" placeholder="empresa@email.com" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prop-password">Senha</Label>
              <Input id="prop-password" name="password" type="password" required />
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
        onClick={() => handleSocialLogin("facebook")}
        disabled={isLoading}
      >
        <Facebook className="mr-2 h-4 w-4" />
        Facebook
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full mt-2"
        onClick={() => handleSocialLogin("google")}
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

      {/* Botão para revelar o acesso administrativo */}
      <Button 
        variant="link" 
        className="w-full mt-4 text-xs opacity-50 hover:opacity-100" 
        onClick={() => setShowAdminAccess(!showAdminAccess)}
      >
        {showAdminAccess ? "Ocultar acesso administrativo" : "Acesso administrativo"}
      </Button>
      
      {/* Seção de administrador oculta */}
      {showAdminAccess && (
        <div className="border border-dashed border-yellow-500 p-4 rounded-md space-y-3 mt-2">
          <h3 className="text-sm font-medium text-center">Criar Superusuário Padrão</h3>
          <div className="space-y-2">
            <Label htmlFor="admin-key">Chave de Administrador</Label>
            <Input 
              id="admin-key" 
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Digite a chave de admin"
              type="password"
            />
          </div>
          <Button
            type="button"
            onClick={handleCreateSuperUser}
            disabled={isLoading || !adminKey}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            {isLoading ? "Criando..." : "Criar Superusuário"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Isso criará um superusuário com email: admin@shearhub.com e senha: Admin123!
          </p>
        </div>
      )}
    </div>
  );
}
