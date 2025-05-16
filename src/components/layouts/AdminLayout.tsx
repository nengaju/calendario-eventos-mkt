
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  User, Settings, LogOut, Home, Users, Calendar, Menu, X, ChevronDown
} from 'lucide-react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [siteName, setSiteName] = useState('CALENDÁRIO DE EVENTOS - MKT');

  // Get site name from local storage if available
  useEffect(() => {
    const savedSettings = localStorage.getItem('themeSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.siteName) {
        setSiteName(settings.siteName);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sidebarLinks = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <Home className="h-5 w-5" />,
      admin: false,
    },
    {
      name: 'Calendário',
      path: '/',
      icon: <Calendar className="h-5 w-5" />,
      admin: false,
    },
    {
      name: 'Usuários',
      path: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      admin: true,
    },
    {
      name: 'Configurações',
      path: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
      admin: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2 md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{siteName}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">{user?.email}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                <Settings className="h-4 w-4 mr-2" /> Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for mobile - overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={closeSidebar} />
        )}

        {/* Sidebar */}
        <aside 
          className={`
            fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out md:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex justify-between items-center p-4 border-b md:hidden">
            <h1 className="font-bold">Menu</h1>
            <Button variant="ghost" size="icon" onClick={closeSidebar}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {sidebarLinks.map((link) => {
                // Skip admin links for non-admin users
                if (link.admin && !isAdmin) return null;
                
                return (
                  <li key={link.path}>
                    <Link 
                      to={link.path} 
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                        ${location.pathname === link.path ? 'bg-gray-100 text-primary' : 'hover:bg-gray-100'}
                      `}
                      onClick={closeSidebar}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
