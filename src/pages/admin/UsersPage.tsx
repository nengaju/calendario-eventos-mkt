
import React from 'react';
import UserManagement from '@/components/admin/UserManagement';
import { useUsers } from '@/context/UserContext';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const UsersPage: React.FC = () => {
  const { users, addUser } = useUsers();
  const { isAuthenticated, user } = useAuth();

  // Usamos useEffect para verificar se há usuários administradores existentes
  React.useEffect(() => {
    if (!isAuthenticated) return;
    
    console.log("Checking for admin users...");
    
    const setupAdminUser = async (email: string, password: string, displayName: string, isBackup: boolean = false) => {
      try {
        // Check if admin exists in users array
        const adminExists = users.some(u => u.username.toLowerCase() === email.toLowerCase() && u.role === "admin");
        
        console.log(`Has ${email} admin:`, adminExists);
        
        if (!adminExists) {
          console.log(`Creating ${email} admin user...`);
          
          // Check if email is valid using regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const isValidEmail = emailRegex.test(email);
          
          if (isValidEmail) {
            // Use email format for valid emails
            try {
              // Check if user exists in profiles
              const { data: existingUserData, error: userError } = await supabase
                .from('profiles')
                .select('id')
                .ilike('username', email)
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
                  duration: 5000, // 5 seconds duration
                });
                
                console.log(`${email} admin updated successfully`);
              } else {
                // Create new admin user with email
                await addUser({
                  username: email,
                  password: password,
                  role: "admin",
                  isActive: true
                });
                
                toast({
                  title: `Administrador ${isBackup ? 'backup ' : ''}configurado`,
                  description: `Usuário ${email} foi configurado como administrador${isBackup ? ' backup' : ''} do sistema`,
                  duration: 5000, // 5 seconds duration
                });
                
                console.log(`${email} admin created successfully`);
              }
            } catch (error: any) {
              console.error(`Erro ao configurar usuário admin ${email}:`, error);
              toast({
                title: "Erro",
                description: `Falha ao configurar usuário ${email}: ${error.message}`,
                variant: "destructive",
                duration: 5000, // 5 seconds duration
              });
            }
          } else {
            // For usernames that aren't valid emails, we'll create them directly as profiles
            try {
              // Create UUID for the new user
              const { data: { user: newUser }, error: authError } = await supabase.auth.admin.createUser({
                email: `${email.toLowerCase().replace(/[^a-z0-9]/g, '')}@temp.com`,
                password: password,
                email_confirm: true,
                user_metadata: {
                  display_name: displayName
                }
              });
              
              if (authError) throw authError;
              
              if (newUser) {
                // Update the username in the profile
                const { error: profileError } = await supabase
                  .from('profiles')
                  .update({ 
                    username: email,
                    role: 'admin'
                  })
                  .eq('id', newUser.id);
                  
                if (profileError) throw profileError;
                
                toast({
                  title: `Administrador ${isBackup ? 'backup ' : ''}configurado`,
                  description: `Usuário ${email} foi configurado como administrador${isBackup ? ' backup' : ''} do sistema`,
                  duration: 5000, // 5 seconds duration
                });
                
                console.log(`${email} admin created successfully`);
              }
            } catch (error: any) {
              console.error(`Erro ao configurar usuário admin ${email}:`, error);
              toast({
                title: "Erro",
                description: `Falha ao configurar usuário ${email}: ${error.message}`,
                variant: "destructive",
                duration: 5000, // 5 seconds duration
              });
            }
          }
        }
      } catch (error: any) {
        console.error(`Erro ao configurar usuário admin ${email}:`, error);
        toast({
          title: "Erro",
          description: `Falha ao configurar usuário ${email}: ${error.message}`,
          variant: "destructive",
          duration: 5000, // 5 seconds duration
        });
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
