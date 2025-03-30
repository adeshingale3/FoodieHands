import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, LogOut, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  toggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToNotifications = () => {
    if (user?.role === 'ngo') {
      navigate('/ngo/notifications');
    } else if (user?.role === 'restaurant') {
      navigate('/restaurant/notifications');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-10">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <h1 className="text-xl font-semibold text-gray-800">
            Foodie Hands
            <span className="text-primary ml-1">.</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNotifications}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
              </div>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
