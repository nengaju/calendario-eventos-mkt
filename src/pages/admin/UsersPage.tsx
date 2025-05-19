
import React, { useEffect } from 'react';
import UserManagement from '@/components/admin/UserManagement';
import { useUsers } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';

const UsersPage: React.FC = () => {
  const { users, addUser } = useUsers();

  // Check if JUNIOR admin exists and create it if not
  useEffect(() => {
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
      }).then(() => {
        toast({
          title: "Administrador criado",
          description: "Usuário JUNIOR foi configurado como administrador do sistema",
        });
      }).catch(error => {
        console.error("Erro ao criar usuário admin:", error);
      });
    }
  }, [users, addUser]);

  return <UserManagement />;
};

export default UsersPage;
