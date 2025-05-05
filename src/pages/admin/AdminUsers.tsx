
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UsersTable } from '@/components/admin/UsersTable';
import { adminApi } from '@/services/admin-api';
import { UserStats } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    let filtered = [...users];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) => 
          user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const userRoleCounts = users.reduce((counts, user) => {
    counts[user.role] = (counts[user.role] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h2>
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant={roleFilter === 'all' ? "default" : "outline"}
            onClick={() => setRoleFilter('all')}
            className="text-xs"
          >
            Todos ({users.length})
          </Button>
          <Button 
            variant={roleFilter === 'client' ? "default" : "outline"}
            onClick={() => setRoleFilter('client')}
            className="text-xs"
          >
            Clientes ({userRoleCounts['client'] || 0})
          </Button>
          <Button 
            variant={roleFilter === 'barber' ? "default" : "outline"}
            onClick={() => setRoleFilter('barber')}
            className="text-xs"
          >
            Barbeiros ({userRoleCounts['barber'] || 0})
          </Button>
          <Button 
            variant={roleFilter === 'owner' ? "default" : "outline"}
            onClick={() => setRoleFilter('owner')}
            className="text-xs"
          >
            Proprietários ({userRoleCounts['owner'] || 0})
          </Button>
          <Button 
            variant={roleFilter === 'admin' || roleFilter === 'superuser' ? "default" : "outline"}
            onClick={() => setRoleFilter('admin')}
            className="text-xs"
          >
            Administradores ({(userRoleCounts['admin'] || 0) + (userRoleCounts['superuser'] || 0)})
          </Button>
        </div>
        
        <div className="flex gap-4">
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredUsers.length} de {users.length} usuários
            </div>
            
            <UsersTable users={filteredUsers} />
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                Nenhum usuário encontrado com os filtros selecionados.
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
