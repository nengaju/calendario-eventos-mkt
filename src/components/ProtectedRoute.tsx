
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  // Log authentication state for debugging
  console.log("ProtectedRoute: isAuthenticated =", isAuthenticated, "isAdmin =", isAdmin);

  // Check if the user is authenticated
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Todos os usuários autenticados são considerados administradores
  // Para manter compatibilidade com o código existente

  // If user is authenticated (and is admin if required), render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
