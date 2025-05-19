
import React, { useState } from 'react';
import { useUsers } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  User, Edit, Trash, UserPlus, Shield, ShieldOff, 
  UserCheck, UserX 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AssigneeType, UserRole } from '@/types';

// Interface for new user data that includes password
interface NewUserData {
  username: string;
  password: string;
  role: UserRole;
  assignee?: string;
  isActive: boolean;
}

const UserManagement: React.FC = () => {
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    setUserRole, 
    setUserAssignee, 
    toggleUserActive 
  } = useUsers();

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('viewer');
  const [newAssignee, setNewAssignee] = useState<string | undefined>(undefined);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('viewer');
  const [editAssignee, setEditAssignee] = useState<string | undefined>(undefined);
  const [editActive, setEditActive] = useState(true);

  const handleAddUser = () => {
    if (newUsername && newPassword) {
      // Create a userData object of type NewUserData to include the password
      const userData: NewUserData = {
        username: newUsername,
        password: newPassword,
        role: newRole,
        assignee: newAssignee,
        isActive: true
      };
      
      addUser(userData);
      
      // Reset form
      setNewUsername('');
      setNewPassword('');
      setNewRole('viewer');
      setNewAssignee(undefined);
      setIsAddDialogOpen(false);
    }
  };

  const openEditDialog = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(userId);
      setEditUsername(user.username || '');
      setEditPassword(''); // Don't show the current password for security
      setEditRole(user.role || 'viewer');
      
      // Convert assignee to string if it's an object
      const assignee = user.assignee ? 
        (typeof user.assignee === 'string' ? user.assignee : user.assignee.id) 
        : undefined;
      
      setEditAssignee(assignee);
      setEditActive(user.isActive || false);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    const user = users.find(u => u.id === editingUser);
    if (!user) return;
    
    // Create a partial user update object without password property if empty
    const userUpdate = {
      ...user,
      username: editUsername,
      role: editRole,
      assignee: editAssignee,
      isActive: editActive
    };
    
    // Pass the password separately via addUser/updateUser
    updateUser(userUpdate, editPassword);
    
    setIsEditDialogOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteUser(userId);
    }
  };

  // Helper function to format assignee display
  const formatAssignee = (assignee: AssigneeType | undefined): string => {
    if (!assignee) return '';
    return typeof assignee === 'string' ? assignee : assignee.username;
  };

  const assignees: string[] = ["MARIANO", "RUBENS", "GIOVANNA", "YAGO", "JÚNIOR"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gerenciamento de Usuários</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" /> Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para criar um novo usuário.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Digite o nome de usuário"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a senha"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Função</Label>
                <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignee">Responsável</Label>
                <Select 
                  value={newAssignee} 
                  onValueChange={(value) => setNewAssignee(value !== "none" ? value : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {assignees.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddUser} disabled={!newUsername || !newPassword}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableCaption>Lista de usuários do sistema</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                  {user.role === 'admin' ? 'Administrador' : 
                   user.role === 'editor' ? 'Editor' : 'Visualizador'}
                </Badge>
              </TableCell>
              <TableCell>
                {user.assignee ? (
                  <Badge variant="outline" className="bg-gray-100">
                    {formatAssignee(user.assignee)}
                  </Badge>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={user.isActive ? 'secondary' : 'destructive'}>
                  {user.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => openEditDialog(user.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => toggleUserActive(user.id)}
                  >
                    {user.isActive ? (
                      <UserX className="h-4 w-4" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setUserRole(user.id, user.role === 'admin' ? 'viewer' : 'admin')}
                  >
                    {user.role === 'admin' ? (
                      <ShieldOff className="h-4 w-4" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-username">Nome de Usuário</Label>
              <Input
                id="edit-username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Digite o nome de usuário"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">
                Senha <span className="text-gray-500 text-xs">(deixe em branco para manter a atual)</span>
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Digite a nova senha"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Função</Label>
              <Select value={editRole} onValueChange={(value) => setEditRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-assignee">Responsável</Label>
              <Select 
                value={editAssignee} 
                onValueChange={(value) => setEditAssignee(value === "none" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {assignees.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="edit-active">Status ativo</Label>
              <Switch 
                id="edit-active" 
                checked={editActive} 
                onCheckedChange={setEditActive} 
              />
              <span className="text-sm text-gray-500 ml-2">
                {editActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateUser} disabled={!editUsername}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
