
import { NavigateFunction } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Redirects user based on their role after successful authentication
 */
export const redirectBasedOnRole = async (email: string, navigate: NavigateFunction) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', email)
      .single();
    
    if (profile) {
      switch (profile.role) {
        case 'superuser':
        case 'admin':
          navigate('/admin');
          break;
        case 'owner':
          navigate('/proprietario');
          break;
        case 'client':
          navigate('/cliente');
          break;
        default:
          navigate('/cliente');
      }
    } else {
      navigate('/cliente'); // Fallback padrão
    }
  } catch (error) {
    console.error("Erro ao buscar o papel do usuário:", error);
    navigate('/cliente'); // Fallback padrão em caso de erro
  }
};

/**
 * Handle login with email and password
 */
export const handleEmailPasswordLogin = async (
  email: string,
  password: string,
  navigate: NavigateFunction,
  setIsLoading: (value: boolean) => void
) => {
  try {
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return false;
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      toast.error(error.message);
      return false;
    }
    
    if (data.user) {
      toast.success("Login realizado com sucesso!");
      // Redireciona baseado no papel do usuário usando o e-mail digitado
      await redirectBasedOnRole(email, navigate);
      return true;
    }
    return false;
  } catch (error: any) {
    console.error("Login error:", error);
    toast.error(error.message || "Erro ao fazer login");
    return false;
  }
};

/**
 * Handle social login (Facebook or Google)
 */
export const handleSocialLogin = async (
  provider: 'facebook' | 'google',
  setIsLoading: (value: boolean) => void
) => {
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
      return false;
    }
    return true;
  } catch (error) {
    console.error(`${provider} login error:`, error);
    toast.error(`Erro ao fazer login com ${provider}`);
    return false;
  }
};
