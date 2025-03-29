import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MapProvider } from "@/contexts/MapContext";
import AppLayout from "@/components/layouts/AppLayout";

// Auth Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Restaurant Pages
import RestaurantDashboard from "@/pages/restaurant/Dashboard";
import DonateFoodForm from "@/pages/restaurant/DonateFoodForm";
import RestaurantNotifications from "@/pages/restaurant/Notifications";
import RestaurantDonations from "@/pages/restaurant/Donations";

// NGO Pages
import NGODashboard from "@/pages/ngo/Dashboard";
import NGONotifications from "@/pages/ngo/Notifications";
import NGODonations from "@/pages/ngo/Donations";
import Analytics from '@/pages/ngo/Analytics';

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import Restaurants from '@/pages/admin/Restaurants';
import NGOs from '@/pages/admin/NGOs';
import Donations from '@/pages/admin/Donations';

// Error Page
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <MapProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Restaurant Routes */}
              <Route element={<AppLayout allowedRoles={['restaurant']} />}>
                <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
                <Route path="/restaurant/donate" element={<DonateFoodForm />} />
                <Route path="/restaurant/notifications" element={<RestaurantNotifications />} />
                <Route path="/restaurant/history" element={<RestaurantDonations />} />
                {/* Add other restaurant routes */}
              </Route>
              
              {/* NGO Routes */}
              <Route element={<AppLayout allowedRoles={['ngo']} />}>
                <Route path="/ngo/dashboard" element={<NGODashboard />} />
                <Route path="/ngo/notifications" element={<NGONotifications />} />
                <Route path="/ngo/donations" element={<NGODonations />} />
                <Route path="/ngo/analytics" element={<Analytics />} />
                {/* Add other NGO routes */}
              </Route>
              
              {/* Admin Routes */}
              <Route element={<AppLayout allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/restaurants" element={<Restaurants />} />
                <Route path="/admin/ngos" element={<NGOs />} />
                <Route path="/admin/donations" element={<Donations />} />
                {/* Add other admin routes */}
              </Route>
              
              {/* Redirect to login */}
              <Route path="/" element={<Login />} />
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </MapProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
