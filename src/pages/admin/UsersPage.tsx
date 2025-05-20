
import React, { useEffect } from 'react';
import UserManagement from '@/components/admin/UserManagement';
import { useUsers } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

const UsersPage: React.FC = () => {
  const { users, addUser } = useUsers();
  const { isAuthenticated, user } = useAuth();

  // Check for admin users and create them if they don't exist
  useEffect(() => {
    if (!isAuthenticated) return;
    
    console.log("Checking for admin users...");
    
    // Check for nengaju@gmail.com admin first (primary admin)
    const hasEmailAdmin = users.some(
      u => u.username === "nengaju@gmail.com" && u.role === "admin"
    );

    console.log("Has nengaju@gmail.com admin:", hasEmailAdmin);

    if (!hasEmailAdmin) {
      console.log("Creating nengaju@gmail.com admin user...");
      // Create nengaju@gmail.com admin user
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
    
    // Create a new admin account as backup
    const hasAdminBackup = users.some(
      u => u.username === "admin@sistema.com" && u.role === "admin"
    );

    if (!hasAdminBackup) {
      console.log("Creating admin@sistema.com backup admin user...");
      // Create admin@sistema.com admin user
      addUser({
        username: "admin@sistema.com",
        password: "Admin@2025",
        role: "admin",
        isActive: true
      }).then(() => {
        toast({
          title: "Administrador backup configurado",
          description: "Usuário admin@sistema.com foi configurado como administrador backup do sistema",
        });
        console.log("admin@sistema.com backup admin created successfully");
      }).catch(error => {
        console.error("Erro ao configurar usuário admin backup:", error);
      });
    }
    
    // JUNIOR is kept as a backup admin
    const hasJuniorAdmin = users.some(
      u => u.username === "JUNIOR" && u.role === "admin"
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
  }, [users, addUser, isAuthenticated, user]);

  return <UserManagement />;
};

export default UsersPage;
