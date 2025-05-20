
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, AuthContextType } from '@/types/auth';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check if the user is authenticated
  const isAuthenticated = !!user;
  // Set isAdmin to true for all authenticated users
  const isAdmin = isAuthenticated;
  const isEditor = isAuthenticated;
  const isViewer = isAuthenticated;

  // Initialize auth state from Supabase
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Convert Supabase user to our User type
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.email || '',
          });
          
          // Defer profile fetching to avoid auth deadlocks
          setTimeout(() => {
            supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
              .then(({ data: profileData, error }) => {
                if (error) {
                  console.error('Error fetching profile:', error);
                  
                  // If profile doesn't exist, create one with admin role
                  if (error.code === 'PGRST116') {
                    supabase
                      .from('profiles')
                      .insert({
                        id: session.user.id,
                        username: session.user.email || '',
                        role: 'admin'
                      })
                      .then(({ error: insertError }) => {
                        if (insertError) {
                          console.error('Error creating profile:', insertError);
                        } else {
                          // Set profile with admin role
                          setProfile({
                            id: session.user.id,
                            username: session.user.email || '',
                            role: 'admin'
                          });
                        }
                      });
                  }
                } else if (profileData) {
                  // Ensure profile has admin role
                  if (profileData.role !== 'admin') {
                    supabase
                      .from('profiles')
                      .update({ role: 'admin' })
                      .eq('id', session.user.id)
                      .then(() => {
                        setProfile({
                          ...profileData,
                          role: 'admin'
                        });
                      });
                  } else {
                    setProfile(profileData);
                  }
                }
              });
          }, 0);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Convert Supabase user to our User type
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.email || '',
        });
        
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              // If profile doesn't exist, create one with admin role
              if (error.code === 'PGRST116') {
                supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    username: session.user.email || '',
                    role: 'admin'
                  })
                  .then(({ error: insertError }) => {
                    if (!insertError) {
                      setProfile({
                        id: session.user.id,
                        username: session.user.email || '',
                        role: 'admin'
                      });
                    }
                  });
              }
            } else if (data) {
              // Ensure profile has admin role
              if (data.role !== 'admin') {
                supabase
                  .from('profiles')
                  .update({ role: 'admin' })
                  .eq('id', session.user.id)
                  .then(() => {
                    setProfile({
                      ...data,
                      role: 'admin'
                    });
                  });
              } else {
                setProfile(data);
              }
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.username,
        password: credentials.password,
      });

      if (error) throw error;
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo(a) de volta!",
      });
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Erro de autenticação",
        description: error.message || "Usuário ou senha inválidos",
        variant: "destructive",
      });
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Sessão encerrada com sucesso",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um problema ao encerrar sua sessão",
        variant: "destructive",
      });
    }
  };

  // Auth context value
  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isEditor,
    isViewer,
    profile,
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

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
