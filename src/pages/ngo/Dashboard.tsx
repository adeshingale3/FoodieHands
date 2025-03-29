
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, DollarSign, Award, Clock } from 'lucide-react';

const NGODashboard: React.FC = () => {
  // Mock data - in a real app, this would come from API calls
  const stats = {
    totalReceived: 356, // kg
    totalValue: 3200, // $
    pointsEarned: 1780,
    pendingDonations: 3,
  };

  const recentDonations = [
    { id: 1, restaurant: 'Italiano Restaurant', items: 'Pasta, Bread, Salad', quantity: 12.5, value: 150, date: '2023-06-15' },
    { id: 2, restaurant: 'Urban Cafe', items: 'Sandwiches, Pastries, Fruits', quantity: 8.2, value: 95, date: '2023-06-12' },
    { id: 3, restaurant: 'Green Kitchen', items: 'Vegetables, Rice, Soup', quantity: 15.3, value: 180, date: '2023-06-08' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">NGO Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of food donations and your impact
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReceived} kg</div>
            <p className="text-xs text-muted-foreground">
              of food saved from waste
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
              value of received food
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pointsEarned}</div>
            <p className="text-xs text-muted-foreground">
              redeem for benefits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Donations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingDonations}</div>
            <p className="text-xs text-muted-foreground">
              awaiting your acceptance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Recent Received Donations</CardTitle>
            <CardDescription>Latest food contributions from restaurants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDonations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{donation.restaurant}</p>
                    <p className="text-sm text-muted-foreground">{donation.items}</p>
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
    </div>
  );
};

export default NGODashboard;
