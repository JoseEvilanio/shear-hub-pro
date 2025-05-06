
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LoginFormHeader } from "./login-form-header";
import { EmailLoginForm } from "./email-login-form";
import { SocialLoginButtons } from "./social-login-buttons";
import { handleEmailPasswordLogin, handleSocialLogin } from "./auth-utils";

export function LoginForm() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("cliente");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const success = await handleEmailPasswordLogin(email, password, navigate, setIsLoading);
    
    if (!success) {
      setIsLoading(false);
    }
  };

  const handleSocialLoginClick = async (provider: 'facebook' | 'google') => {
    setIsLoading(true);
    const success = await handleSocialLogin(provider, setIsLoading);
    
    if (!success) {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-card rounded-lg shadow-lg animate-fade-in">
      <LoginFormHeader />

      <Tabs defaultValue="cliente" onValueChange={setUserType} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="cliente">Sou Cliente</TabsTrigger>
          <TabsTrigger value="proprietario">Sou Proprietário</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cliente" className="space-y-4">
          <EmailLoginForm 
            onSubmit={handleLogin} 
            isLoading={isLoading}
            userType="cliente"
          />
        </TabsContent>
        
        <TabsContent value="proprietario" className="space-y-4">
          <EmailLoginForm 
            onSubmit={handleLogin} 
            isLoading={isLoading}
            userType="proprietario"
          />
        </TabsContent>
      </Tabs>
      
      <SocialLoginButtons 
        onSocialLogin={handleSocialLoginClick}
        isLoading={isLoading}
      />
    </div>
  );
}
