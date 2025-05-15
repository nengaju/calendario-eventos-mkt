
import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [siteName, setSiteName] = useState('Calendário de Eventos Kanban');
  
  // Buscar o nome do site das configurações ao carregar o componente
  useEffect(() => {
    const savedSettings = localStorage.getItem('themeSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.siteName) {
        setSiteName(settings.siteName);
      }
    }
  }, []);
  
  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{siteName}</h1>
          <p className="mt-2 text-gray-600">Faça login para acessar o sistema</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
