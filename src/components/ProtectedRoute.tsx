
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

  // Check if admin access is required but user is not an admin
  if (requireAdmin && !isAdmin) {
    console.log("Admin access required but user is not admin, redirecting to dashboard");
    return <Navigate to="/admin" replace />;
  }

  // If user is authenticated (and is admin if required), render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
