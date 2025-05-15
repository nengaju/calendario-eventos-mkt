
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, AuthContextType, UserRole } from '@/types/auth';
import { toast } from '@/components/ui/use-toast';
import { AssigneeType } from '@/types';

// Local storage keys
const USER_STORAGE_KEY = 'kanban-user';
const USERS_STORAGE_KEY = 'kanban-users';

// Initial admin user
const initialAdmin: User = {
  id: '1',
  username: 'JUNIOR',
  password: '1234', // In a real app, this would be hashed
  role: 'admin',
  isActive: true,
};

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([initialAdmin]);
  
  // Check if the user is authenticated
  const isAuthenticated = !!user;
  // Check if the user is an admin
  const isAdmin = user?.role === 'admin';

  // Initialize users from localStorage or create default admin
  useEffect(() => {
    // Try to load logged in user from local storage
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }

    // Load users from localStorage or initialize with admin
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (error) {
        console.error('Error parsing users from localStorage:', error);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([initialAdmin]));
      }
    } else {
      // Save initial admin user if no users exist
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([initialAdmin]));
    }
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    const { username, password } = credentials;
    
    // Find user with matching credentials
    const foundUser = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password && u.isActive
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(foundUser));
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo(a), ${foundUser.username}!`,
      });
      return true;
    }

    toast({
      title: "Erro de autenticação",
      description: "Usuário ou senha inválidos",
      variant: "destructive",
    });
    return false;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    toast({
      title: "Logout realizado",
      description: "Sessão encerrada com sucesso",
    });
  };

  // Auth context value
  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook for admin functionality
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  // Load users from localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (error) {
        console.error('Error parsing users from localStorage:', error);
      }
    }
  }, []);

  // Function to add a new user
  const addUser = (newUser: Omit<User, "id">) => {
    const user: User = {
      ...newUser,
      id: crypto.randomUUID(),
    };
    
    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    
    toast({
      title: "Usuário criado",
      description: `Usuário ${user.username} criado com sucesso`,
    });
    
    return user;
  };

  // Function to update a user
  const updateUser = (updatedUser: User) => {
    const updatedUsers = users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    
    // Update current user in localStorage if it's the same user
    const currentUser = localStorage.getItem(USER_STORAGE_KEY);
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      if (parsedUser.id === updatedUser.id) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      }
    }
    
    toast({
      title: "Usuário atualizado",
      description: `Usuário ${updatedUser.username} atualizado com sucesso`,
    });
  };

  // Function to delete a user
  const deleteUser = (userId: string) => {
    const userToDelete = users.find(user => user.id === userId);
    if (!userToDelete) return;
    
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    
    toast({
      title: "Usuário removido",
      description: `Usuário ${userToDelete.username} removido com sucesso`,
    });
  };

  // Function to get all users
  const getAllUsers = () => {
    return users;
  };

  // Function to get a user by id
  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  // Function to set a user as admin
  const setUserRole = (userId: string, role: UserRole) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, role } : user
    );
    
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    
    toast({
      title: "Função atualizada",
      description: `Usuário definido como ${role === 'admin' ? 'administrador' : 'usuário comum'}`,
    });
  };

  // Function to set a user's assignee
  const setUserAssignee = (userId: string, assignee?: AssigneeType) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, assignee } : user
    );
    
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    
    toast({
      title: "Responsável atualizado",
      description: assignee 
        ? `Usuário definido como ${assignee}` 
        : "Responsável removido do usuário",
    });
  };

  // Function to toggle user active status
  const toggleUserActive = (userId: string) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    );
    
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    
    const user = updatedUsers.find(u => u.id === userId);
    toast({
      title: "Status atualizado",
      description: `Usuário ${user?.username} ${user?.isActive ? 'ativado' : 'desativado'} com sucesso`,
    });
  };

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserById,
    setUserRole,
    setUserAssignee,
    toggleUserActive,
  };
};
