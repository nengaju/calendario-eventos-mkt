
import React, { useEffect } from 'react';
import UserManagement from '@/components/admin/UserManagement';
import { useUsers } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

const UsersPage: React.FC = () => {
  const { users, addUser } = useUsers();
  const { isAuthenticated } = useAuth();

  // Check if JUNIOR admin and nengaju@gmail.com admin exist and create them if not
  useEffect(() => {
    if (!isAuthenticated) return;
    
    console.log("Checking for admin users...");
    
    // Check for nengaju@gmail.com admin first (primary admin)
    const hasEmailAdmin = users.some(
      user => user.username === "nengaju@gmail.com" && user.role === "admin"
    );

    console.log("Has nengaju@gmail.com admin:", hasEmailAdmin);

    if (!hasEmailAdmin) {
      console.log("Creating nengaju@gmail.com admin user...");
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
        console.log("nengaju@gmail.com admin created successfully");
      }).catch(error => {
        console.error("Erro ao configurar usuário admin:", error);
      });
    }
    
    // JUNIOR is kept as a backup admin
    const hasJuniorAdmin = users.some(
      user => user.username === "JUNIOR" && user.role === "admin"
    );

    console.log("Has JUNIOR admin:", hasJuniorAdmin);

    if (!hasJuniorAdmin) {
      console.log("Creating JUNIOR admin user...");
      // Create JUNIOR admin user
      addUser({
        username: "JUNIOR",
        password: "Secreta@183183",
        role: "admin",
        isActive: true
      }).then(() => {
        console.log("JUNIOR admin created successfully");
      }).catch(error => {
        console.error("Erro ao criar usuário admin:", error);
      });
    }
  }, [users, addUser, isAuthenticated]);

  return <UserManagement />;
};

export default UsersPage;
