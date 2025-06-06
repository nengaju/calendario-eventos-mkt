
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/types';
import { AssigneeType } from '@/types';
import { useAuth } from '@/context/AuthContext';

// Define user types
export interface User {
  id: string;
  username: string;
  role: UserRole;
  assignee?: AssigneeType;
  isActive: boolean;
}

interface NewUserData {
  username: string;
  password: string;
  role: UserRole;
  assignee?: AssigneeType;
  isActive: boolean;
}

interface UsersContextType {
  users: User[];
  addUser: (userData: NewUserData) => Promise<void>;
  updateUser: (user: User, password?: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  setUserRole: (id: string, role: UserRole) => Promise<void>;
  setUserAssignee: (id: string, assignee?: AssigneeType) => Promise<void>;
  toggleUserActive: (id: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

// Create Context
const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users from profiles table
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      const formattedUsers = data.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: true, // Default to active since we don't store this in DB yet
      }));

      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      toast({
        title: "Erro",
        description: "Falha ao carregar usuários",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh users manually
  const refreshUsers = async () => {
    await fetchUsers();
  };

  // Add a new user
  const addUser = async (userData: NewUserData) => {
    try {
      // First create auth user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.username,
        password: userData.password,
        options: {
          data: {
            role: userData.role,
          }
        }
      });

      if (authError) throw authError;

      // Make sure profile is created with correct role
      if (authData.user) {
        // Since the trigger might not set the role correctly, explicitly update it
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            username: userData.username,
            role: userData.role,
          }, { onConflict: 'id' });
          
        if (profileError) throw profileError;
        
        // Update the UI with new user
        const newUser = {
          id: authData.user.id,
          username: userData.username,
          role: userData.role,
          assignee: userData.assignee,
          isActive: userData.isActive,
        };
        
        setUsers(prevUsers => [...prevUsers, newUser]);
        
        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso",
          duration: 5000,
        });
        
        console.log(`${userData.username} created successfully with role ${userData.role}`);
      }
    } catch (error: any) {
      console.error('Error adding user:', error.message);
      toast({
        title: "Erro",
        description: error.message || "Falha ao adicionar usuário",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Update an existing user
  const updateUser = async (user: User, password?: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: user.username,
          role: user.role
        })
        .eq('id', user.id);

      if (error) throw error;

      // If password was provided, update it
      if (password && password.trim() !== '') {
        // Here we would need admin access to update the password
        console.log('Would update password for user:', user.id);
        toast({
          title: "Informação",
          description: "Atualização de senha só é possível através do painel do Supabase",
          duration: 5000,
        });
      }

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === user.id ? user : u))
      );

      // If updating current user's role, refresh the page to apply new permissions
      if (user.id === currentUser?.id) {
        toast({
          title: "Atualização de função",
          description: "Sua função foi alterada. As alterações serão aplicadas na próxima sessão.",
          duration: 5000,
        });
      }

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error updating user:', error.message);
      toast({
        title: "Erro",
        description: "Falha ao atualizar usuário",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Delete a user
  const deleteUser = async (id: string) => {
    try {
      // Delete from Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      if (authError) throw authError;

      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso",
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error deleting user:', error.message);
      toast({
        title: "Erro",
        description: "Falha ao excluir usuário. Nota: Admin não tem permissão para deletar usuários através da API. Use o dashboard do Supabase.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Update a user's role
  const setUserRole = async (id: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === id ? { ...user, role } : user))
      );

      // If updating current user's role, notify about permission changes
      if (id === currentUser?.id) {
        toast({
          title: "Alerta",
          description: "Você alterou sua própria função. As alterações de permissões serão aplicadas na próxima sessão.",
          duration: 5000,
        });
      }

      toast({
        title: "Sucesso",
        description: `Função do usuário atualizada para ${role === 'admin' ? 'Administrador' : role === 'editor' ? 'Editor' : 'Visualizador'}`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error updating user role:', error.message);
      toast({
        title: "Erro",
        description: "Falha ao atualizar função do usuário",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Update a user's assignee
  const setUserAssignee = async (id: string, assignee?: AssigneeType) => {
    try {
      // Update local state only, as assignee is not stored in DB yet
      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === id ? { ...user, assignee } : user))
      );

      toast({
        title: "Sucesso",
        description: "Responsável atualizado com sucesso",
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error updating user assignee:', error.message);
      toast({
        title: "Erro",
        description: "Falha ao atualizar responsável",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Toggle user active status
  const toggleUserActive = async (id: string) => {
    try {
      const user = users.find(u => u.id === id);
      if (!user) return;

      const newStatus = !user.isActive;

      // Update local state only, as isActive is not stored in DB yet
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === id ? { ...u, isActive: newStatus } : u))
      );

      toast({
        title: "Sucesso",
        description: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error toggling user status:', error.message);
      toast({
        title: "Erro",
        description: "Falha ao alterar status do usuário",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Context value
  const value: UsersContextType = {
    users,
    addUser,
    updateUser,
    deleteUser,
    setUserRole,
    setUserAssignee,
    toggleUserActive,
    refreshUsers
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};

// Hook to use the Users Context
export const useUsers = () => {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};
