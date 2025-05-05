
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserStats } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useState } from "react";

interface UsersTableProps {
  users: UserStats[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'client':
        return <Badge variant="outline">Cliente</Badge>;
      case 'barber':
        return <Badge variant="secondary">Barbeiro</Badge>;
      case 'owner':
        return <Badge variant="default" className="bg-blue-500">Proprietário</Badge>;
      case 'admin':
      case 'superuser':
        return <Badge className="bg-purple-500">Administrador</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getInitials = (firstName: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cadastrado em</TableHead>
              <TableHead>Agendamentos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {getInitials(user.first_name, user.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      {user.first_name} {user.last_name}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>
                  {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>{user.appointmentCount}</TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Detalhes do Usuário</DialogTitle>
                      </DialogHeader>
                      {selectedUser && (
                        <div className="space-y-4 mt-4">
                          <div className="flex justify-center">
                            <Avatar className="h-24 w-24">
                              <AvatarImage src={selectedUser.avatar_url} />
                              <AvatarFallback className="text-2xl">
                                {getInitials(selectedUser.first_name, selectedUser.last_name)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium">Nome:</p>
                              <p>
                                {selectedUser.first_name} {selectedUser.last_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Email:</p>
                              <p>{selectedUser.email}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Tipo de usuário:</p>
                              <p>{getRoleBadge(selectedUser.role)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Data de cadastro:</p>
                              <p>
                                {format(
                                  new Date(selectedUser.created_at),
                                  "dd 'de' MMMM 'de' yyyy",
                                  { locale: ptBR }
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Agendamentos realizados:</p>
                              <p>{selectedUser.appointmentCount}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
