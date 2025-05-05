
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminApi } from '@/services/admin-api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SuperUserContextType {
  isSuperUser: boolean;
  loading: boolean;
}

const SuperUserContext = createContext<SuperUserContextType>({
  isSuperUser: false,
  loading: true,
});

export const useSuperUser = () => useContext(SuperUserContext);

export function SuperUserProvider({ children }: { children: ReactNode }) {
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSuperUserStatus = async () => {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        // Check if user is a superuser
        const isAdmin = await adminApi.isSuperUser();
        setIsSuperUser(isAdmin);
      } catch (error) {
        console.error('Error checking superuser status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSuperUserStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setIsSuperUser(false);
      } else if (event === 'SIGNED_IN') {
        checkSuperUserStatus();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <SuperUserContext.Provider value={{ isSuperUser, loading }}>
      {children}
    </SuperUserContext.Provider>
  );
}

// Higher-order component to protect superuser routes
export function withSuperUserProtection<P extends object>(Component: React.ComponentType<P>) {
  return function SuperUserProtected(props: P) {
    const { isSuperUser, loading } = useSuperUser();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && !isSuperUser) {
        toast.error('Acesso restrito apenas para Administradores');
        navigate('/login');
      }
    }, [isSuperUser, loading, navigate]);

    if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    
    return isSuperUser ? <Component {...props} /> : null;
  };
}
