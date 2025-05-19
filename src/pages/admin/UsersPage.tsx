
import React, { useEffect } from 'react';
import UserManagement from '@/components/admin/UserManagement';
import { useUsers } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';

const UsersPage: React.FC = () => {
  const { users, addUser } = useUsers();

  // Check if JUNIOR admin and nengaju@gmail.com admin exist and create them if not
  useEffect(() => {
    // Check for JUNIOR admin
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
    
    // Check for nengaju@gmail.com admin
    const hasEmailAdmin = users.some(
      user => user.username === "nengaju@gmail.com" && user.role === "admin"
    );

    if (!hasEmailAdmin) {
      // Find if the user exists but isn't an admin
      const existingUser = users.find(user => user.username === "nengaju@gmail.com");
      
      if (existingUser) {
        // Update the user's role to admin if they exist
        addUser({
          username: "nengaju@gmail.com",
          password: "Secreta@183183", // Set a known password
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
    }
  }, [users, addUser]);

  return <UserManagement />;
};

export default UsersPage;
