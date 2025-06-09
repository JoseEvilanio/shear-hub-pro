import { useState } from 'react';
import { ProtectedAdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Check, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function Superusuarios() {
  const [email, setEmail] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'create' | 'promote'>('create');
  const [cooldown, setCooldown] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(0);

  const startCooldownTimer = () => {
    setCooldown(true);
    setCooldownTimer(60);
    
    const interval = setInterval(() => {
      setCooldownTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCooldown(false);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handlePromoteToSuperUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !adminKey) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (cooldown) {
      setError(`Aguarde ${cooldownTimer} segundos antes de tentar novamente`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // First, check if user exists and get their ID
      const { data: userDataArr, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .limit(1);

      if (userError) throw new Error('Erro ao buscar usuário: ' + userError.message);
      
      if (!userDataArr || userDataArr.length === 0) {
        throw new Error('Usuário não encontrado. Verifique se o usuário já está cadastrado no sistema.');
      }
      
      const userId = userDataArr[0].id;
      
      // Call the edge function to promote the user to superuser
      const { data, error: promotionError } = await supabase.functions.invoke('promote-superuser', {
        body: { 
          user_id: userId,
          admin_key: adminKey
        }
      });

      if (promotionError) throw new Error('Erro ao promover usuário: ' + promotionError.message);
      
      setSuccess(`Usuário ${email} promovido para superuser com sucesso!`);
      toast.success(`Usuário promovido para superuser com sucesso!`);
      
      // Reset form
      setEmail('');
      setAdminKey('');

      // Start cooldown timer to prevent rate limit errors
      startCooldownTimer();
      
    } catch (err: any) {
      console.error('Error promoting superuser:', err);
      setError(err.message || 'Ocorreu um erro ao promover o usuário');
      toast.error('Falha ao promover usuário');
      
      // If it's a rate limit error, start the cooldown timer
      if (err.message && err.message.includes('security purposes')) {
        startCooldownTimer();
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Função para criar um novo usuário e já promover para superuser
  const handleCreateSuperUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !adminKey) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (cooldown) {
      setError(`Aguarde ${cooldownTimer} segundos antes de tentar novamente`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const password = "Admin123!"; // Default password for new superusers
      
      // Create a new user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: "Super",
            last_name: "User",
            role: 'admin' // Start as admin
          }
        }
      });
      
      if (signUpError) throw new Error('Erro ao criar usuário: ' + signUpError.message);
      
      if (!authData.user) {
        throw new Error('Falha ao criar usuário');
      }
      
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the edge function to promote the user to superuser
      const { data, error: promotionError } = await supabase.functions.invoke('promote-superuser', {
        body: { 
          user_id: authData.user.id,
          admin_key: adminKey
        }
      });

      if (promotionError) throw new Error('Erro ao promover usuário: ' + promotionError.message);
      
      setSuccess(`Superusuário criado com sucesso! Email: ${email}, Senha: ${password}`);
      toast.success(`Superusuário criado com sucesso!`);
      
      // Reset form
      setEmail('');
      setAdminKey('');
      
      // Start cooldown timer to prevent rate limit errors
      startCooldownTimer();
      
    } catch (err: any) {
      console.error('Error creating superuser:', err);
      setError(err.message || 'Ocorreu um erro ao criar o superusuário');
      toast.error('Falha ao criar superusuário');
      
      // If it's a rate limit error, start the cooldown timer
      if (err.message && err.message.includes('security purposes')) {
        startCooldownTimer();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Gerenciar Superusuários</h2>
        </div>

        <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50 mb-6">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-400">Informação Importante</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            Esta página é restrita apenas para superusuários. Utilize os formulários abaixo para criar novos superusuários
            ou promover usuários existentes. A chave de administrador é necessária para estas operações.
          </AlertDescription>
        </Alert>

        <div className="flex space-x-4 mb-6">
          <Button 
            variant={actionType === 'create' ? 'default' : 'outline'}
            onClick={() => setActionType('create')}
          >
            Criar Novo Superusuário
          </Button>
          <Button 
            variant={actionType === 'promote' ? 'default' : 'outline'}
            onClick={() => setActionType('promote')}
          >
            Promover Usuário Existente
          </Button>
        </div>

        {actionType === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Superusuário</CardTitle>
              <CardDescription>
                Use este formulário para criar um novo usuário e promovê-lo imediatamente para superusuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSuperUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email do novo usuário</Label>
                  <Input 
                    id="new-email"
                    type="email" 
                    placeholder="email@exemplo.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-admin-key">Chave de Administrador</Label>
                  <Input 
                    id="new-admin-key"
                    type="password" 
                    placeholder="Chave de admin para autorização" 
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading || cooldown}
                  className="w-full"
                >
                  {loading ? 'Criando...' : 'Criar Superusuário'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {actionType === 'promote' && (
          <Card>
            <CardHeader>
              <CardTitle>Promover Usuário Existente</CardTitle>
              <CardDescription>
                Use este formulário para promover um usuário existente para superusuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePromoteToSuperUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promote-email">Email do usuário</Label>
                  <Input 
                    id="promote-email"
                    type="email" 
                    placeholder="email@exemplo.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="promote-admin-key">Chave de Administrador</Label>
                  <Input 
                    id="promote-admin-key"
                    type="password" 
                    placeholder="Chave de admin para autorização" 
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading || cooldown}
                  className="w-full"
                >
                  {loading ? 'Promovendo...' : 'Promover para Superusuário'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-400">Sucesso</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {cooldown && (
          <Alert variant="default" className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900/50">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-400">Aguarde</AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              Por motivos de segurança, aguarde {cooldownTimer} segundos antes de tentar novamente.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </ProtectedAdminLayout>
  );
}
