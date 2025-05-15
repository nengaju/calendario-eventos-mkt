
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import UsersPage from "./pages/admin/UsersPage";
import Settings from "./pages/admin/Settings";
import MainLayout from "./components/layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { EventProvider } from "./context/EventContext";
import ThemeSettings from "./pages/admin/ThemeSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <EventProvider>
          <Toaster />
          <Sonner position="top-right" />
          <BrowserRouter>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  {/* Admin Dashboard Routes */}
                  <Route path="/admin" element={<Dashboard />} />
                  <Route path="/admin/settings" element={<Settings />} />
                  <Route path="/admin/theme" element={<ThemeSettings />} />
                  
                  {/* Admin-only Routes */}
                  <Route element={<ProtectedRoute requireAdmin={true} />}>
                    <Route path="/admin/users" element={<UsersPage />} />
                  </Route>
                  
                  {/* Calendar Routes */}
                  <Route path="/" element={<Index />} />
                </Route>
              </Route>
              
              {/* Redirect from unknown routes to 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </EventProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
