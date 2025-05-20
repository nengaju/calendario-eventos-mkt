
import React, { useEffect } from 'react';
import UserManagement from '@/components/admin/UserManagement';
import { useUsers } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const UsersPage: React.FC = () => {
  const { users, addUser } = useUsers();
  const { isAuthenticated, user } = useAuth();

  // Check for admin users and create them if they don't exist
  useEffect(() => {
    if (!isAuthenticated) return;
    
    console.log("Checking for admin users...");
    
    const setupAdminUser = async (email: string, password: string, displayName: string, isBackup: boolean = false) => {
      // Check if admin exists in users array
      const adminExists = users.some(u => u.username === email && u.role === "admin");
      
      console.log(`Has ${email} admin:`, adminExists);
      
      if (!adminExists) {
        console.log(`Creating ${email} admin user...`);
        
        try {
          // We can't use getUserByEmail as it doesn't exist in the API
          // Instead we'll search for the user in our profiles table
          const { data: existingUserData, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', email)
            .maybeSingle();
            
          if (userError) throw userError;
          
          if (existingUserData) {
            // User exists in profiles but not in our local state with admin role
            // Update role directly in profiles table
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', existingUserData.id);
              
            if (updateError) throw updateError;
            
            toast({
              title: `Administrador ${isBackup ? 'backup ' : ''}atualizado`,
              description: `Usuário ${email} foi configurado como administrador${isBackup ? ' backup' : ''} do sistema`,
            });
            
            console.log(`${email} admin updated successfully`);
          } else {
            // Create new admin user
            await addUser({
              username: email,
              password: password,
              role: "admin",
              isActive: true
            });
            
            toast({
              title: `Administrador ${isBackup ? 'backup ' : ''}configurado`,
              description: `Usuário ${email} foi configurado como administrador${isBackup ? ' backup' : ''} do sistema`,
            });
            
            console.log(`${email} admin created successfully`);
          }
        } catch (error: any) {
          console.error(`Erro ao configurar usuário admin ${email}:`, error);
          toast({
            title: "Erro",
            description: `Falha ao configurar usuário ${email}: ${error.message}`,
            variant: "destructive",
          });
        }
      }
    };
    
    // Setup all admin users
    setupAdminUser("nengaju@gmail.com", "Secreta@183183", "Administrador principal");
    setupAdminUser("admin@sistema.com", "Admin@2025", "Administrador backup", true);
    setupAdminUser("JUNIOR", "Secreta@183183", "Administrador backup", true);
    
  }, [users, addUser, isAuthenticated, user]);

  return <UserManagement />;
};

export default UsersPage;
