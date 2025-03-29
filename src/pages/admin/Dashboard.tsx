
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Users, DollarSign, Award, TrendingUp } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // Mock data - in a real app, this would come from API calls
  const stats = {
    totalRestaurants: 42,
    totalNGOs: 28,
    totalDonations: 356,
    totalFoodWeight: 2450, // kg
    totalValue: 28500, // $
  };

  const recentDonations = [
    { id: 1, restaurant: 'Italiano Restaurant', ngo: 'Food For All', quantity: 12.5, value: 150, date: '2023-06-15' },
    { id: 2, restaurant: 'Urban Cafe', ngo: 'Hunger Relief', quantity: 8.2, value: 95, date: '2023-06-12' },
    { id: 3, restaurant: 'Green Kitchen', ngo: 'Community Food Bank', quantity: 15.3, value: 180, date: '2023-06-08' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
            <p className="text-xs text-muted-foreground">
              registered restaurants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NGOs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNGOs}</div>
            <p className="text-xs text-muted-foreground">
              registered organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donations</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonations}</div>
            <p className="text-xs text-muted-foreground">
              completed donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Saved</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFoodWeight} kg</div>
            <p className="text-xs text-muted-foreground">
              of food waste prevented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue}</div>
            <p className="text-xs text-muted-foreground">
              value of donated food
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>Latest completed donations on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDonations.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">{donation.restaurant} → {donation.ngo}</p>
                  <p className="text-xs text-muted-foreground">{donation.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{donation.quantity} kg</p>
                  <p className="text-sm text-muted-foreground">${donation.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
