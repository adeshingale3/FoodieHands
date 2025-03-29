
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Package, Bell, Settings, BarChart4, 
  Users, ShoppingBag, FileText, UserCog 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const renderLinks = () => {
    if (user?.role === 'restaurant') {
      return (
        <div className="space-y-1">
          <NavLink href="/restaurant/dashboard" icon={<Home />} label="Dashboard" active={location.pathname === '/restaurant/dashboard'} />
          <NavLink href="/restaurant/donate" icon={<Package />} label="Donate Food" active={location.pathname === '/restaurant/donate'} />
          <NavLink href="/restaurant/history" icon={<FileText />} label="Donation History" active={location.pathname === '/restaurant/history'} />
          <NavLink href="/restaurant/notifications" icon={<Bell />} label="Notifications" active={location.pathname === '/restaurant/notifications'} />
          <NavLink href="/restaurant/settings" icon={<Settings />} label="Settings" active={location.pathname === '/restaurant/settings'} />
        </div>
      );
    } else if (user?.role === 'ngo') {
      return (
        <div className="space-y-1">
          <NavLink href="/ngo/dashboard" icon={<Home />} label="Dashboard" active={location.pathname === '/ngo/dashboard'} />
          <NavLink href="/ngo/donations" icon={<ShoppingBag />} label="Donations" active={location.pathname === '/ngo/donations'} />
          <NavLink href="/ngo/notifications" icon={<Bell />} label="Notifications" active={location.pathname === '/ngo/notifications'} />
          {user && 'isPremium' in user && user.isPremium && (
            <NavLink href="/ngo/analytics" icon={<BarChart4 />} label="Analytics" active={location.pathname === '/ngo/analytics'} />
          )}
          <NavLink href="/ngo/settings" icon={<Settings />} label="Settings" active={location.pathname === '/ngo/settings'} />
        </div>
      );
    } else if (user?.role === 'admin') {
      return (
        <div className="space-y-1">
          <NavLink href="/admin/dashboard" icon={<Home />} label="Dashboard" active={location.pathname === '/admin/dashboard'} />
          <NavLink href="/admin/restaurants" icon={<ShoppingBag />} label="Restaurants" active={location.pathname === '/admin/restaurants'} />
          <NavLink href="/admin/ngos" icon={<Users />} label="NGOs" active={location.pathname === '/admin/ngos'} />
          <NavLink href="/admin/donations" icon={<Package />} label="Donations" active={location.pathname === '/admin/donations'} />
          <NavLink href="/admin/settings" icon={<UserCog />} label="Settings" active={location.pathname === '/admin/settings'} />
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <h2 className="text-xl font-bold flex items-center space-x-2">
          <span className="bg-primary text-white p-1 rounded">w2t</span>
          <span>waste2taste</span>
        </h2>
      </div>
      
      <div className="flex-1 p-4">
        <nav className="space-y-8">
          {renderLinks()}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="text-sm">
            <p className="font-medium truncate max-w-32">{user?.name}</p>
            <p className="text-gray-500 truncate max-w-32">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon, label, active }) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center py-2 px-3 text-sm font-medium rounded-md transition-colors",
        active
          ? "bg-primary-100 text-primary"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
};

export default Sidebar;
