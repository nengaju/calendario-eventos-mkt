
import React, { useEffect } from 'react';
import UserManagement from '@/components/admin/UserManagement';
import { useUsers } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';

const UsersPage: React.FC = () => {
  const { users, addUser } = useUsers();

  // Check if JUNIOR admin and nengaju@gmail.com admin exist and create them if not
  useEffect(() => {
    // Check for nengaju@gmail.com admin first (primary admin)
    const hasEmailAdmin = users.some(
      user => user.username === "nengaju@gmail.com" && user.role === "admin"
    );

    if (!hasEmailAdmin) {
      // Create nengaju@gmail.com admin user or update if exists
      addUser({
        username: "nengaju@gmail.com",
        password: "Secreta@183183",
        role: "admin",
        isActive: true
      }).then(() => {
        toast({
          title: "Administrador configurado",
          description: "Usuário nengaju@gmail.com foi configurado como administrador do sistema",
        });
      }).catch(error => {
        console.error("Erro ao configurar usuário admin:", error);
      });
    }
    
    // JUNIOR is kept as a backup admin
    const hasJuniorAdmin = users.some(
      user => user.username === "JUNIOR" && user.role === "admin"
    );

    if (!hasJuniorAdmin) {
      // Create JUNIOR admin user
      addUser({
        username: "JUNIOR",
        password: "Secreta@183183",
        role: "admin",
        isActive: true
      }).catch(error => {
        console.error("Erro ao criar usuário admin:", error);
      });
    }
  }, [users, addUser]);

  return <UserManagement />;
};

export default UsersPage;
